import { AppConstants } from '@/app/_data-models/AppConstants';
import { AppSettings } from '@/app/_data-models/AppSettings';
import { clientHeader } from '@/app/_data-models/ClientHeader';
import { HordeApiParams } from '@/app/_data-models/ImageParamsForHordeApi';
import { debugSaveApiResponse } from '../artbot/debugSaveResponse';

export interface GenerateSuccessResponse {
  success: boolean;
  id: string;
  kudos: number;
}

export interface GenerateErrorResponse {
  success: boolean;
  errors: Array<{ [key: string]: string }>;
  statusCode: number;
  message: string;
}

interface HordeSuccessResponse {
  id: string;
  kudos: number;
}

interface HordeErrorResponse {
  message: string;
  errors: Array<{ [key: string]: string }>;
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

// Allow 3 requests per second
const rateLimiter = new RateLimiter(3, 1000);

let taskCounter = 0;

export default async function generateImage(
  imageParams: HordeApiParams
): Promise<GenerateSuccessResponse | GenerateErrorResponse> {
  const taskId = `generate_${taskCounter++}`;
  
  // Wait for rate limit slot
  await rateLimiter.waitForSlot();
  
  let statusCode = 0; // Initialize statusCode with a default value
  try {
    console.log(`Processing image generation task: ${taskId}`);
    const apikey =
      AppSettings.apikey()?.trim() || AppConstants.AI_HORDE_ANON_KEY;
    const res = await fetch(
      `${AppConstants.AI_HORDE_PROD_URL}/api/v2/generate/async`,
      {
        body: JSON.stringify(imageParams),
        cache: 'no-store',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader(),
          apikey: apikey
        }
      }
    );

    statusCode = res.status;
    const data: HordeSuccessResponse | HordeErrorResponse = await res.json();

    if ('id' in data) {
      await debugSaveApiResponse(
        data.id,
        { data, params: imageParams },
        `/api/v2/generate/async`
      );
      console.log(`Image generation task completed: ${taskId}`);
      return {
        success: true,
        ...data
      };
    } else {
      console.log(`Image generation task failed: ${taskId}`);
      return {
        success: false,
        statusCode,
        errors: data.errors || [],
        message: data.message
      };
    }
  } catch (err) {
    console.log(
      `Error: Unable to send generate image request for task: ${taskId}`
    );
    console.log(err);

    return {
      success: false,
      statusCode,
      errors: [{ error: 'unknown error' }],
      message: 'unknown error'
    };
  }
}
