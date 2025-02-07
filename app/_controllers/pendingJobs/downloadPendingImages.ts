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

const queueSystems = new Map<string, TaskQueue<{ success: boolean }>>();
const queueSystemLocks = new Map<string, Promise<void>>();

const getQueueSystem = async (
  jobId: string
): Promise<TaskQueue<{ success: boolean }>> => {
  // If a queue already exists, return it immediately
  const existingQueue = queueSystems.get(jobId);
  if (existingQueue) {
    return existingQueue;
  }

  // If there's a lock for this jobId, wait for it
  const existingLock = queueSystemLocks.get(jobId);
  if (existingLock) {
    await existingLock;
    return queueSystems.get(jobId)!;
  }

  // Create a new lock
  let resolveLock: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    resolveLock = resolve;
  });
  queueSystemLocks.set(jobId, lockPromise);

  try {
    // Double-check if queue was created while we were waiting
    const queueAfterLock = queueSystems.get(jobId);
    if (queueAfterLock) {
      return queueAfterLock;
    }

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
    queueSystemLocks.delete(jobId);
    resolveLock!();
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

      // Check if all images already exist
      const allExist = await Promise.all(
        response.generations.map((gen) =>
          checkImageExistsInDexie({ image_id: gen.id })
        )
      );

      if (allExist.every((exists) => exists)) {
        // All images already exist, mark job as done and clean up
        await updatePendingImage(jobDetails.artbot_id, {
          status: JobStatus.Done,
          images_completed: response.generations.length,
          images_failed: 0,
          api_response: response // Include the final API response
        });
        // Clean up the queue since we're done with this job
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
      if (response.done && response.finished === response.generations.length) {
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

      // Clean up the queue if we're done
      if (currentStatus === JobStatus.Done) {
        queueSystems.delete(jobDetails.artbot_id);
      }

      return { success: true };
    }, jobDetails.artbot_id);
  } catch (error) {
    console.error('Error in downloadImages:', error);
    // Make sure to clean up the queue on error
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
      const allImagesProcessed =
        newImagesCompleted + newImagesFailed === jobDetails.images_requested;

      await db.hordeJobs
        .where('artbot_id')
        .equals(jobDetails.artbot_id)
        .modify({
          images_completed: newImagesCompleted,
          images_failed: newImagesFailed,
          status: allImagesProcessed ? JobStatus.Done : currentJob.status,
          updated_timestamp: Date.now()
        });
    }
  );
};
