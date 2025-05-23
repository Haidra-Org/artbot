import downloadImage, {
  DownloadErrorResponse,
  DownloadSuccessResponse
} from '@/app/_api/horde/download';
import imageStatus, {
  StatusErrorResponse,
  StatusSuccessResponse
} from '@/app/_api/horde/status';
import { AppSettings } from '@/app/_data-models/AppSettings';
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob';
import {
  ImageFileInterface,
  ImageStatus,
  ImageType
} from '@/app/_data-models/ImageFile_Dexie';
import { checkImageExistsInDexie } from '@/app/_db/ImageFiles';
import { ImageError, JobStatus } from '@/app/_types/ArtbotTypes';
import { GenMetadata, HordeGeneration } from '@/app/_types/HordeTypes';
import { updatePendingImage } from './updatePendingImage';
import { fetchJobByArtbotId } from '@/app/_db/hordeJobs';
import { TaskQueue } from '@/app/_data-models/TaskQueue';
import { appBasepath } from '@/app/_utils/browserUtils';
import { db } from '@/app/_db/dexie';

const STATUS_CHECK_INTERVAL = 6050; // ms

class Mutex {
  private _locked: boolean = false;
  private _waiting: (() => void)[] = [];

  /**
   * Acquires the mutex. If the mutex is already locked, waits until it is released.
   * @returns {Promise<void>}
   */
  async acquire(): Promise<void> {
    if (this._locked) {
      await new Promise<void>((resolve) => this._waiting.push(resolve));
    } else {
      this._locked = true;
    }
  }

  /**
   * Releases the mutex. If there are pending acquisitions, resolves the next one.
   */
  release(): void {
    if (this._waiting.length > 0) {
      const resolve = this._waiting.shift();
      resolve && resolve();
    } else {
      this._locked = false;
    }
  }
}

const queueSystems = new Map<string, TaskQueue<{ success: boolean }>>();
const queueSystemMutexes = new Map<string, Mutex>();

/**
 * Gets or creates a TaskQueue for a given job id using a Mutex for synchronization.
 *
 * This function checks if a queue already exists for the given job id and returns it if available.
 * Otherwise, it acquires a Mutex (from queueSystemMutexes) to ensure that only one TaskQueue is created
 * for the job id. It uses a double-check within the critical section to avoid race conditions.
 *
 * @param {string} jobId - A unique identifier for the job.
 * @returns {Promise<TaskQueue<{ success: boolean }>>} A promise that resolves to a TaskQueue.
 */
const getQueueSystem = async (
  jobId: string
): Promise<TaskQueue<{ success: boolean }>> => {
  // If a queue already exists, return it immediately.
  const existingQueue = queueSystems.get(jobId);
  if (existingQueue) return existingQueue;

  // Get the Mutex for the job, or create one if it doesn't exist.
  let mutex = queueSystemMutexes.get(jobId);
  if (!mutex) {
    mutex = new Mutex();
    queueSystemMutexes.set(jobId, mutex);
  }

  // Acquire the mutex.
  await mutex.acquire();
  try {
    // Double-check if the queue was created while waiting.
    const queueAfterLock = queueSystems.get(jobId);
    if (queueAfterLock) return queueAfterLock;

    // Create new queue
    const newQueue = new TaskQueue<{ success: boolean }>(
      STATUS_CHECK_INTERVAL,
      {
        preventDuplicates: true
      }
    );
    queueSystems.set(jobId, newQueue);
    return newQueue;
  } finally {
    // Always release the mutex.
    mutex.release();
  }
};

export const downloadImages = async ({
  jobDetails,
  kudos
}: {
  jobDetails: ArtBotHordeJob;
  kudos: number;
}): Promise<{ success: boolean }> => {
  const queueSystem = await getQueueSystem(jobDetails.artbot_id);
  try {
    return await queueSystem.enqueue(async () => {
      const response = await imageStatus(jobDetails.horde_id);
      if (!isValidResponse(response) || !response.generations) {
        console.log(`Invalid response for jobId: ${jobDetails.artbot_id}`);
        return { success: false };
      }

      // Safety check - if we're expecting more images than we've seen, don't mark as done
      const totalExpectedImages = jobDetails.images_requested || 0;
      const totalProcessedImages =
        (response.finished || 0) +
        (response.processing || 0) +
        (response.waiting || 0);

      if (totalProcessedImages < totalExpectedImages) {
        console.log(
          `Warning: Expected ${totalExpectedImages} images but only found ${totalProcessedImages} in response. Job ${jobDetails.artbot_id} might have more pending images.`
        );
        // Don't return here, continue processing what we have but don't mark as done
      }

      // Check if all images already exist
      const allExist = await Promise.all(
        response.generations.map((gen) =>
          checkImageExistsInDexie({ image_id: gen.id })
        )
      );

      if (
        allExist.every((exists) => exists) &&
        response.finished === totalExpectedImages
      ) {
        // All images already exist and we have all expected images, mark job as done and clean up
        await updatePendingImage(jobDetails.artbot_id, {
          status: JobStatus.Done,
          images_completed: response.generations.length,
          images_failed: 0,
          api_response: response
        });
        queueSystems.delete(jobDetails.artbot_id);
        return { success: true };
      }

      const {
        completedGenerations,
        downloadImagesPromise,
        gen_metadata,
        imageErrors,
        images_completed,
        images_failed
      } = await processImageGenerations(
        jobDetails.artbot_id,
        response.generations
      );

      await handleSettledImageDownloads({
        downloadImagesPromise,
        completedGenerations,
        images_completed,
        jobDetails,
        kudos
      });

      // Determine the current status
      let currentStatus = jobDetails.status;
      const isReallyDone =
        response.done &&
        response.finished === totalExpectedImages &&
        response.processing === 0 &&
        response.waiting === 0;

      if (isReallyDone) {
        currentStatus = JobStatus.Done;
      } else if (response.processing > 0) {
        currentStatus = JobStatus.Processing;
      } else if (
        response.waiting > 0 ||
        (response.queue_position !== null && response.queue_position > 0)
      ) {
        currentStatus = JobStatus.Queued;
      }

      // Update the job status
      await updatePendingImage(jobDetails.artbot_id, {
        status: currentStatus,
        images_completed,
        images_failed,
        errors: imageErrors,
        gen_metadata,
        api_response: response,
        processing: response.processing || 0
      });

      // Clean up the queue if we're done or in error state
      if (currentStatus === JobStatus.Done || currentStatus === JobStatus.Error) {
        queueSystems.delete(jobDetails.artbot_id);
      }

      return { success: true };
    }, jobDetails.artbot_id);
  } catch (error) {
    console.error('Error in downloadImages:', error);
    // On network error, don't clean up the queue - let it retry
    if (
      error instanceof TypeError &&
      error.message.includes('Connection is closed')
    ) {
      console.log('Network error occurred, will retry on next interval');
      return { success: false };
    }
    // For other errors, clean up the queue
    queueSystems.delete(jobDetails.artbot_id);
    return { success: false };
  }
};

const isValidResponse = (
  response: StatusSuccessResponse | StatusErrorResponse
): response is StatusSuccessResponse => {
  return (
    response.success &&
    'generations' in response &&
    Array.isArray(response.generations)
  );
};

const handleCensoredImage = (allowNsfw: boolean): ImageError => {
  if (!allowNsfw) {
    return { type: 'nsfw', message: 'Image blocked due to user NSFW setting.' };
  }
  return {
    type: 'csam',
    message:
      'The GPU worker was unable to complete this request. Try again? (Error code: X)'
  };
};

const processImageGenerations = async (
  jobId: string,
  generations: HordeGeneration[]
): Promise<{
  completedGenerations: HordeGeneration[];
  downloadImagesPromise: Promise<
    DownloadSuccessResponse | DownloadErrorResponse | null
  >[];
  gen_metadata: GenMetadata[];
  imageErrors: ImageError[];
  images_completed: number;
  images_failed: number;
}> => {
  const gen_metadata: GenMetadata[] = [];
  const imageErrors: ImageError[] = [];
  let images_completed = 0;
  let images_failed = 0;

  const downloadImagesPromise: Promise<
    DownloadSuccessResponse | DownloadErrorResponse | null
  >[] = [];
  const completedGenerations: HordeGeneration[] = [];

  const allowNsfw = AppSettings.get('allowNsfwImages');

  // Get initial job state
  const jobDetails = await fetchJobByArtbotId(jobId);
  if (jobDetails) {
    images_completed = jobDetails.images_completed || 0;
    images_failed = jobDetails.images_failed || 0;
  }

  for (const generation of generations) {
    if (generation.censored) {
      images_failed++;
      imageErrors.push(handleCensoredImage(allowNsfw));
      completedGenerations.push(generation);
      downloadImagesPromise.push(Promise.resolve(null));
    } else {
      const exists = await checkImageExistsInDexie({
        image_id: generation.id
      });
      if (!exists) {
        images_completed++;
        gen_metadata.push(generation.gen_metadata as unknown as GenMetadata);
        downloadImagesPromise.push(downloadImage(generation.img));
        completedGenerations.push(generation);

        // Update ArtBot completed image count
        fetch(`${appBasepath()}/api/status`, {
          method: 'POST',
          cache: 'no-store',
          body: JSON.stringify({
            type: 'image_done'
          })
        });
      } else {
        completedGenerations.push(generation);
        downloadImagesPromise.push(Promise.resolve(null));
      }
    }
  }

  return {
    completedGenerations,
    downloadImagesPromise,
    gen_metadata,
    imageErrors,
    images_completed,
    images_failed
  };
};

const createImageFile = (
  jobDetails: ArtBotHordeJob,
  generation: HordeGeneration,
  response: DownloadSuccessResponse,
  imageKudos: number
): ImageFileInterface => ({
  artbot_id: jobDetails.artbot_id,
  horde_id: jobDetails.horde_id,
  image_id: generation.id,
  imageType: ImageType.IMAGE,
  imageStatus: ImageStatus.OK,
  model: generation.model,
  imageBlobBuffer: response.blobBuffer,
  gen_metadata: generation.gen_metadata,
  seed: generation.seed,
  worker_id: generation.worker_id,
  worker_name: generation.worker_name,
  kudos: imageKudos.toFixed(2),
  apiResponse: JSON.stringify(generation)
});

const handleSettledImageDownloads = async (params: {
  downloadImagesPromise: Promise<
    DownloadSuccessResponse | DownloadErrorResponse | null
  >[];
  completedGenerations: HordeGeneration[];
  images_completed: number;
  jobDetails: ArtBotHordeJob;
  kudos: number;
}): Promise<void> => {
  const {
    downloadImagesPromise,
    completedGenerations,
    images_completed,
    jobDetails,
    kudos
  } = params;

  // Wait for all downloads to complete before starting transaction
  const results = await Promise.allSettled(downloadImagesPromise);
  const imageKudos = images_completed > 0 ? kudos / images_completed : 0;

  // Count successful downloads
  let successfulDownloads = 0;

  // Wrap everything in a single transaction
  await db.transaction(
    'rw',
    [db.hordeJobs, db.imageFiles, db.imageRequests, db.favorites],
    async () => {
      // First get current job state
      const currentJob = await db.hordeJobs
        .where('artbot_id')
        .equals(jobDetails.artbot_id)
        .first();

      if (!currentJob) {
        console.error('Job not found in database:', jobDetails.artbot_id);
        return;
      }

      // Then process and save the images
      for (let index = 0; index < results.length; index++) {
        const result = results[index];
        if (
          result.status === 'fulfilled' &&
          result.value &&
          'success' in result.value &&
          result.value.success &&
          'blobBuffer' in result.value &&
          !completedGenerations[index].censored
        ) {
          const image = createImageFile(
            jobDetails,
            completedGenerations[index],
            result.value as DownloadSuccessResponse,
            imageKudos
          );

          // Check if image already exists before adding
          const existingImage = await db.imageFiles
            .where('image_id')
            .equals(image.image_id)
            .first();

          if (!existingImage) {
            await db.imageFiles.add(image);
            await db.favorites.add({
              artbot_id: image.artbot_id,
              image_id: image.image_id,
              favorited: false
            });
            successfulDownloads++;
          }
        }
      }

      // Update the job status with current counts
      const newImagesCompleted =
        currentJob.images_completed + successfulDownloads;
      const newImagesFailed =
        currentJob.images_failed + (jobDetails.images_failed || 0);

      // Important: Don't change the job status here - let the main downloadImages function
      // handle that based on the API response. Just update the counts.
      await db.hordeJobs
        .where('artbot_id')
        .equals(jobDetails.artbot_id)
        .modify({
          images_completed: newImagesCompleted,
          images_failed: newImagesFailed,
          updated_timestamp: Date.now()
        });
    }
  );
};
