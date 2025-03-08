import { AppConstants } from '@/app/_data-models/AppConstants';
import { clientHeader } from '@/app/_data-models/ClientHeader';
import { HordeJobResponse } from '@/app/_types/HordeTypes';
import { debugSaveApiResponse } from '../artbot/debugSaveResponse';
import { TaskQueue } from '@/app/_data-models/TaskQueue';

interface HordeErrorResponse {
  message: string;
}

export interface CheckSuccessResponse extends HordeJobResponse {
  success: boolean;
}

export interface CheckErrorResponse extends HordeErrorResponse {
  success: boolean;
  statusCode: number;
}

const MAX_REQUESTS_PER_SECOND = 2;
const STATUS_CHECK_INTERVAL = 1025 / MAX_REQUESTS_PER_SECOND;

const queueSystems = new Map<
  string,
  TaskQueue<CheckSuccessResponse | CheckErrorResponse>
>();

const getQueueSystem = (
  jobId: string
): TaskQueue<CheckSuccessResponse | CheckErrorResponse> => {
  if (!queueSystems.has(jobId)) {
    queueSystems.set(
      jobId,
      new TaskQueue<CheckSuccessResponse | CheckErrorResponse>(
        STATUS_CHECK_INTERVAL,
        { preventDuplicates: true }
      )
    );
  }
  return queueSystems.get(jobId)!;
};

// Worker initialization
let worker: Worker | null = null;

function getWorker() {
  if (!worker && typeof Worker !== 'undefined') {
    const workerUrl = typeof import.meta !== 'undefined'
      ? new URL('./check_webworker.ts', import.meta.url)
      : './check_webworker.js';
    worker = new Worker(workerUrl);
  }
  return worker;
}

const performCheckUsingWorker = (
  jobId: string
): Promise<CheckSuccessResponse | CheckErrorResponse> => {
  return new Promise((resolve) => {
    const url = `${AppConstants.AI_HORDE_PROD_URL}/api/v2/generate/check/${jobId}`;
    const headers = {
      'Content-Type': 'application/json',
      'Client-Agent': clientHeader()
    };

    const workerInstance = getWorker();
    workerInstance?.postMessage({ jobId, url, headers });

    workerInstance?.addEventListener('message', (event) => {
      const { jobId: returnedJobId, result } = event.data;
      if (returnedJobId === jobId) {
        resolve(result);
      }
    });
  });
};

export default async function checkImage(
  jobId: string
): Promise<CheckSuccessResponse | CheckErrorResponse> {
  const queueSystem = getQueueSystem(jobId);

  return await queueSystem.enqueue(
    async () => {
      const result = await performCheckUsingWorker(jobId);
      if (result.success) {
        await debugSaveApiResponse(
          jobId,
          result,
          `/api/v2/generate/check/${jobId}`
        );
      }
      return result;
    },
    jobId // Use jobId as the unique taskId
  );
}
