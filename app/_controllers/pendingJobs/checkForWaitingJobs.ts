import { AppConstants } from '@/app/_data-models/AppConstants';
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests';
import { getPendingImagesByStatusFromAppState } from '@/app/_stores/PendingImagesStore';
import { ImageError, JobStatus } from '@/app/_types/ArtbotTypes';
import { ImageParamsForHordeApi } from '@/app/_data-models/ImageParamsForHordeApi';
import generateImage, {
  GenerateErrorResponse
} from '@/app/_api/horde/generate';
import { sleep } from '@/app/_utils/sleep';
import checkImage from '@/app/_api/horde/check';
import { updatePendingImage } from './updatePendingImage';
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob';
import { transitionJobFromWaitingToRequested } from '@/app/_db/hordeJobs';

const INITIAL_WAIT_TIME = 750;

export const checkForWaitingJobs = async (): Promise<void> => {
  // Only count jobs that are actually using the remote API
  const activeJobs = getPendingImagesByStatusFromAppState([
    JobStatus.Requested, // Just sent to API, waiting for initial response
    JobStatus.Queued, // In API queue
    JobStatus.Processing // Currently being processed by API
  ]);

  if (activeJobs.length >= AppConstants.MAX_CONCURRENT_JOBS) {
    return;
  }

  const waitingJobs = getPendingImagesByStatusFromAppState([
    JobStatus.Waiting
  ]);

  if (waitingJobs.length === 0) {
    return;
  }

  // Process multiple waiting jobs up to the concurrent limit
  const jobsToProcess = Math.min(
    waitingJobs.length,
    AppConstants.MAX_CONCURRENT_JOBS - activeJobs.length
  );

  // Process jobs in parallel
  const processingPromises = waitingJobs.slice(0, jobsToProcess).map(async (waitingJob) => {
    // Try to atomically transition the job from Waiting to Requested
    const transitionedJob = await transitionJobFromWaitingToRequested(
      waitingJob.artbot_id
    );

    // If null, another instance already picked up this job
    if (!transitionedJob) {
      return;
    }

    const [imageRequest] =
      (await getImageRequestsFromDexieById([waitingJob.artbot_id])) || [];

    if (!imageRequest) {
      // If no image request found, revert the job status
      await updatePendingImage(waitingJob.artbot_id, {
        status: JobStatus.Error,
        errors: [{ type: 'other', message: 'Image request not found' }]
      });
      return;
    }

    try {
      const { apiParams } = await ImageParamsForHordeApi.build(imageRequest);
      const apiResponse = await generateImage(apiParams);

      if (!apiResponse || 'errors' in apiResponse) {
        await handleApiError(
          waitingJob.artbot_id,
          apiResponse || { errors: [{ error: 'unknown error' }] }
        );
        return;
      }

      if ('id' in apiResponse) {
        await processSuccessfulResponse(waitingJob.artbot_id, apiResponse.id);
      }
    } catch (error) {
      console.error('Unexpected error in checkForWaitingJobs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await updatePendingImage(waitingJob.artbot_id, {
        status: JobStatus.Error,
        errors: [{ 
          type: 'other', 
          message: `Unexpected error occurred: ${errorMessage}` 
        }]
      });
    }
  });

  // Wait for all jobs to be processed
  await Promise.all(processingPromises);
};

const handleApiError = async (
  jobId: string,
  apiResponse: GenerateErrorResponse
) => {
  const errorMessages: ImageError[] = [];
  const hasErrors =
    'errors' in apiResponse && Object.keys(apiResponse.errors).length > 0;

  // Add the main error message
  if (apiResponse.message && hasErrors) {
    errorMessages.push({ type: 'default', message: apiResponse.message });
  }

  // Add specific errors from the errors object
  if (apiResponse.errors && typeof apiResponse.errors === 'object') {
    Object.entries(apiResponse.errors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        errorMessages.push({ type: 'specific', field: key, message: value });
      } else {
        errorMessages.push({
          type: 'specific',
          field: key,
          message: JSON.stringify(value)
        });
      }
    });
  }

  // If no error fields were added, add a default 'other' error
  if (!hasErrors) {
    errorMessages.push({
      type: 'other',
      message: apiResponse.message || 'An unknown error occurred'
    });
  }

  await updatePendingImage(jobId, {
    status: JobStatus.Error,
    errors: errorMessages
  });

  console.error(`API error: ${JSON.stringify(apiResponse)}`);
};

const processSuccessfulResponse = async (jobId: string, hordeId: string) => {
  await sleep(INITIAL_WAIT_TIME);
  const jobDetails = await checkImage(hordeId);

  if ('is_possible' in jobDetails && jobDetails.is_possible === false) {
    await handleImpossibleJob(
      jobId,
      hordeId,
      jobDetails as unknown as ArtBotHordeJob
    );
    return;
  }

  if ('wait_time' in jobDetails) {
    await updateJobStatus(
      jobId,
      hordeId,
      jobDetails as unknown as ArtBotHordeJob
    );
  }
};

const handleImpossibleJob = async (
  jobId: string,
  hordeId: string,
  jobDetails: ArtBotHordeJob
) => {
  await updatePendingImage(jobId, {
    horde_id: hordeId,
    init_wait_time: jobDetails.wait_time,
    is_possible: false,
    status: JobStatus.Queued, // Need to mark as queued so we can still check if job starts processing (e.g., GPU comes online).
    jobErrorMessage:
      'There are currently no GPU workers that can complete this request. Continue waiting or try changing settings.',
    wait_time: jobDetails.wait_time,
    api_response: { ...jobDetails }
  });
};

const updateJobStatus = async (
  jobId: string,
  hordeId: string,
  jobDetails: ArtBotHordeJob
) => {
  let status = JobStatus.Queued;

  if (jobDetails.processing >= 1) {
    status = JobStatus.Processing;
  }

  await updatePendingImage(jobId, {
    horde_id: hordeId,
    init_wait_time: jobDetails.wait_time,
    is_possible: jobDetails.is_possible,
    status,
    wait_time: jobDetails.wait_time,
    api_response: { ...jobDetails }
  });
};
