import { JobStatus } from '@/app/_types/ArtbotTypes';
import { StatusSuccessResponse } from '@/app/_api/horde/status';
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob';
import {
  getPendingImagesByStatusFromAppState,
  updateCompletedJobInPendingImagesStore
} from '@/app/_stores/PendingImagesStore';
import { sleep } from '@/app/_utils/sleep';
import checkImage, {
  CheckErrorResponse,
  CheckSuccessResponse
} from '@/app/_api/horde/check';
import { downloadImages } from './downloadPendingImages';
import { updatePendingImage } from './updatePendingImage';
import { getImagesForArtbotJobFromDexie } from '@/app/_db/ImageFiles';
import { db } from '@/app/_db/dexie';

// Constants
const MAX_REQUESTS_PER_SECOND = 2;
const REQUEST_INTERVAL = 1000 / MAX_REQUESTS_PER_SECOND;
const CACHE_TIMEOUT = 750; // Time in ms before a job can be checked again
const PENDING_CHECK_INTERVAL = 1500; // Time in ms between checks of pending jobs
const ARTIFICIAL_DELAY = 50; // Delay in ms to prevent rate limiting and allow statusCache to update

// Request cache to manage API call frequency
const requestCache = new Map<string, number>();
let pendingLastChecked = 0;
let isCheckingPending = false;

// Main function to check pending jobs
export const checkPendingJobs = async (): Promise<
  'skipped' | 'no_jobs' | 'processing'
> => {
  // Add lock to prevent concurrent executions
  if (isCheckingPending) {
    return 'skipped';
  }

  try {
    isCheckingPending = true;

    if (shouldSkipCheck()) return 'skipped';

    const pendingJobs = getPendingImagesByStatusFromAppState([
      JobStatus.Queued,
      JobStatus.Processing
    ]);

    if (pendingJobs.length === 0) {
      resetPendingLastChecked();
      return 'no_jobs';
    }

    updatePendingLastChecked();

    const filteredHordeIds = getFilteredHordeIds(pendingJobs);
    const results = await checkImagesStatus(filteredHordeIds);

    await processResults(results, pendingJobs, filteredHordeIds);

    return 'processing';
  } finally {
    isCheckingPending = false;
  }
};

const shouldSkipCheck = (): boolean =>
  Date.now() - pendingLastChecked < PENDING_CHECK_INTERVAL;

const resetPendingLastChecked = (): void => {
  pendingLastChecked = 0;
};

const updatePendingLastChecked = (): void => {
  pendingLastChecked = Date.now();
};

const getFilteredHordeIds = (pendingJobs: ArtBotHordeJob[]): string[] => {
  const hordeIds = pendingJobs.map((job) => job.horde_id);
  return hordeIds.filter((id) => {
    const lastChecked = requestCache.get(id);
    if (!lastChecked || Date.now() - lastChecked > REQUEST_INTERVAL) {
      requestCache.set(id, Date.now());
      return true;
    }
    return false;
  });
};

const checkImagesStatus = async (
  filteredHordeIds: string[]
): Promise<
  PromiseSettledResult<CheckSuccessResponse | CheckErrorResponse>[]
> => {
  const imageCheckPromises = filteredHordeIds.map((id) => checkImage(id));
  return Promise.allSettled(imageCheckPromises);
};

const processResults = async (
  results: PromiseSettledResult<CheckSuccessResponse | CheckErrorResponse>[],
  pendingJobs: ArtBotHordeJob[],
  filteredHordeIds: string[]
): Promise<void> => {
  for (let index = 0; index < results.length; index++) {
    const result = results[index];
    const hordeId = filteredHordeIds[index];
    const job = pendingJobs.find(j => j.horde_id === hordeId);
    
    if (!job) {
      console.error(`Could not find job for horde ID ${hordeId}`);
      continue;
    }
    
    if (result.status === 'fulfilled') {
      await handleFulfilledResult(result.value, job);
    } else {
      console.error(
        `Error checking image with ID ${hordeId}:`,
        result.reason
      );
    }
    scheduleIdUnblocking(hordeId);
  }
};

const handleNotFound = async (job: ArtBotHordeJob): Promise<void> => {
  await db.transaction(
    'rw',
    [db.hordeJobs, db.imageFiles, db.imageRequests],
    async () => {
      const images = await getImagesForArtbotJobFromDexie(job.artbot_id);
      if (images.length === 0) {
        await updatePendingImage(job.artbot_id, {
          status: JobStatus.Error,
          jobErrorMessage: "Job has expired or couldn't be found.",
          errors: [
            {
              type: 'notfound',
              message: 'Job with request id not found.'
            }
          ]
        });
      } else if (images.length > 0) {
        await updatePendingImage(job.artbot_id, {
          status: JobStatus.Done
        });
      }
    }
  );
};

const handleFulfilledResult = async (
  response: StatusSuccessResponse | CheckErrorResponse,
  job: ArtBotHordeJob
): Promise<void> => {
  if (isNotFound(response)) {
    await handleNotFound(job);
    return;
  }

  if (isTooManyRequests(response)) {
    handleTooManyRequests();
    return;
  }

  if (!isSuccessResponse(response)) {
    await handleErrorResponse(job, response);
  } else if (isJobFinished(response)) {
    await handleFinishedJob(job, response);
  } else {
    await handleOngoingJob(job, response);
  }
};

const isNotFound = (
  response: StatusSuccessResponse | CheckErrorResponse
): boolean => 'statusCode' in response && response.statusCode === 404;

const isTooManyRequests = (
  response: StatusSuccessResponse | CheckErrorResponse
): boolean => 'statusCode' in response && response.statusCode === 429;

const handleTooManyRequests = (): void => {
  pendingLastChecked = Date.now() + 15000;
  console.warn('Error: Too many requests. Delaying next check.');
};

const isSuccessResponse = (
  response: StatusSuccessResponse | CheckErrorResponse
): response is StatusSuccessResponse =>
  'success' in response && response.success;

const handleErrorResponse = async (
  job: ArtBotHordeJob,
  response: CheckErrorResponse
): Promise<void> => {
  await updatePendingImage(job.artbot_id, {
    status: JobStatus.Error,
    errors: [
      {
        type: 'other',
        message: response.message || 'Unknown error occurred'
      }
    ]
  });
  console.error(`Job error for ${job.artbot_id}:`, response.message);
};

const isJobFinished = (response: StatusSuccessResponse): boolean =>
  response.finished > 0 || response.done;

const handleFinishedJob = async (
  job: ArtBotHordeJob,
  response: StatusSuccessResponse
): Promise<void> => {
  await sleep(ARTIFICIAL_DELAY);
  await downloadImages({
    jobDetails: job,
    kudos: response.kudos
  });

  await db.transaction(
    'rw',
    [db.hordeJobs, db.imageFiles, db.imageRequests],
    async () => {
      if (response.done) {
        const success = job.images_requested !== job.images_failed;
        await updatePendingImage(job.artbot_id, {
          status: success ? JobStatus.Done : JobStatus.Error
        });
        updateCompletedJobInPendingImagesStore();
      } else {
        await updatePendingImage(job.artbot_id, {
          queue_position: response.queue_position,
          wait_time: response.wait_time,
          api_response: { ...response }
        });
      }
    }
  );
};

const handleOngoingJob = async (
  job: ArtBotHordeJob,
  response: StatusSuccessResponse
): Promise<void> => {
  const status =
    response.processing >= 1 ? JobStatus.Processing : JobStatus.Queued;

  await db.transaction(
    'rw',
    [db.hordeJobs, db.imageFiles, db.imageRequests],
    async () => {
      await updatePendingImage(job.artbot_id, {
        status,
        queue_position: response.queue_position,
        wait_time: response.wait_time,
        api_response: { ...response }
      });
    }
  );
};

const scheduleIdUnblocking = (id: string): void => {
  setTimeout(() => requestCache.delete(id), CACHE_TIMEOUT);
};
