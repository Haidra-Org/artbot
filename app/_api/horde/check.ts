import { AppConstants } from '@/app/_data-models/AppConstants';
import { clientHeader } from '@/app/_data-models/ClientHeader';
import { HordeJobResponse } from '@/app/_types/HordeTypes';
import { debugSaveApiResponse } from '../artbot/debugSaveResponse';

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

// Simple rate limiter that allows concurrent requests
class RateLimiter {
  private requestTimes: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    // Remove old entries outside the window
    this.requestTimes = this.requestTimes.filter(time => now - time < this.windowMs);
    
    if (this.requestTimes.length >= this.maxRequests) {
      // Wait until the oldest request is outside the window
      const oldestRequest = this.requestTimes[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 10; // +10ms buffer
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      // Recursive call to check again
      return this.waitForSlot();
    }
    
    this.requestTimes.push(now);
  }
}

// Allow 2 requests per second for check endpoints
const rateLimiter = new RateLimiter(2, 1000);

// Worker initialization
let worker: Worker | null = null;

function getWorker() {
  if (!worker && typeof Worker !== 'undefined') {
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
      reject(new Error('Worker not available'));
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
  await rateLimiter.waitForSlot();
  
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
