import { AppConstants } from '@/app/_data-models/AppConstants';
import { clientHeader } from '@/app/_data-models/ClientHeader';
import { HordeJobResponse } from '@/app/_types/HordeTypes';
import { debugSaveApiResponse } from '../artbot/debugSaveResponse';
import { checkRateLimiter } from './rateLimiter';

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

// Worker initialization
let worker: Worker | null = null;

function getWorker() {
  if (!worker && typeof Worker !== 'undefined') {
    // Check if we're in a test environment
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      // Return null in test environment to avoid import.meta.url error
      return null;
    }
    worker = new Worker(new URL('./check_webworker.ts', import.meta.url));
  }
  return worker;
}

const performCheckUsingWorker = (
  jobId: string
): Promise<CheckSuccessResponse | CheckErrorResponse> => {
  return new Promise((resolve, reject) => {
    const url = `${AppConstants.AI_HORDE_PROD_URL}/api/v2/generate/check/${jobId}`;
    const headers = {
      'Content-Type': 'application/json',
      'Client-Agent': clientHeader()
    };

    const workerInstance = getWorker();
    if (!workerInstance) {
      // Fallback to regular fetch in test environment
      fetch(url, { headers })
        .then(response => {
          return response.json().then(result => ({
            ok: response.ok,
            status: response.status,
            result
          }));
        })
        .then(({ ok, status, result }) => {
          if (ok) {
            resolve({ ...result, success: true });
          } else {
            resolve({
              success: false,
              statusCode: status,
              message: result.message || 'Unknown error'
            });
          }
        })
        .catch(error => {
          reject(error);
        });
      return;
    }

    // Create a unique handler for this specific request
    const messageHandler = (event: MessageEvent) => {
      const { jobId: returnedJobId, result } = event.data;
      if (returnedJobId === jobId) {
        workerInstance.removeEventListener('message', messageHandler);
        resolve(result);
      }
    };

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      workerInstance.removeEventListener('message', messageHandler);
      reject(new Error(`Check request timed out for job ${jobId}`));
    }, 25000); // 25 second timeout

    workerInstance.addEventListener('message', messageHandler);
    workerInstance.postMessage({ jobId, url, headers });

    // Clear timeout on success
    const originalResolve = resolve;
    resolve = (result) => {
      clearTimeout(timeout);
      originalResolve(result);
    };
  });
};

export default async function checkImage(
  jobId: string
): Promise<CheckSuccessResponse | CheckErrorResponse> {
  // Wait for rate limit slot
  await checkRateLimiter.waitForSlot();
  
  const result = await performCheckUsingWorker(jobId);
  if (result.success) {
    await debugSaveApiResponse(
      jobId,
      result,
      `/api/v2/generate/check/${jobId}`
    );
  }
  return result;
}
