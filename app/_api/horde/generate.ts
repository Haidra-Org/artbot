import { AppConstants } from '@/app/_data-models/AppConstants';
import { AppSettings } from '@/app/_data-models/AppSettings';
import { clientHeader } from '@/app/_data-models/ClientHeader';
import { HordeApiParams } from '@/app/_data-models/ImageParamsForHordeApi';
import { debugSaveApiResponse } from '../artbot/debugSaveResponse';
import { TaskQueue } from '@/app/_data-models/TaskQueue';

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

const imageGenerationQueue = new TaskQueue<
  GenerateSuccessResponse | GenerateErrorResponse
>(600, { preventDuplicates: false });

let taskCounter = 0;

export default function generateImage(
  imageParams: HordeApiParams
): Promise<GenerateSuccessResponse | GenerateErrorResponse> {
  const taskId = `generate_${taskCounter++}`;

  return imageGenerationQueue.enqueue(async () => {
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
  }, taskId);
}
