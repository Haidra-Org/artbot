import { AppConstants } from '@/app/_data-models/AppConstants'
import { clientHeader } from '@/app/_data-models/ClientHeader'
import { HordeJobResponse } from '@/app/_types/HordeTypes'
import { debugSaveApiResponse } from '../artbot/debugSaveResponse'
import { TaskQueue } from '@/app/_data-models/TaskQueue'

interface HordeErrorResponse {
  message: string
}

export interface CheckSuccessResponse extends HordeJobResponse {
  success: boolean
}

export interface CheckErrorResponse extends HordeErrorResponse {
  success: boolean
  statusCode: number
}

const MAX_REQUESTS_PER_SECOND = 2
const STATUS_CHECK_INTERVAL = 1025 / MAX_REQUESTS_PER_SECOND

const queueSystems = new Map<
  string,
  TaskQueue<CheckSuccessResponse | CheckErrorResponse>
>()

const getQueueSystem = (
  jobId: string
): TaskQueue<CheckSuccessResponse | CheckErrorResponse> => {
  if (!queueSystems.has(jobId)) {
    queueSystems.set(
      jobId,
      new TaskQueue<CheckSuccessResponse | CheckErrorResponse>(
        `CheckQueue-${jobId}`,
        STATUS_CHECK_INTERVAL,
        { preventDuplicates: true } // Enable duplicate prevention for status checks
      )
    )
  }
  return queueSystems.get(jobId)!
}

async function performCheck(
  jobId: string
): Promise<CheckSuccessResponse | CheckErrorResponse> {
  let statusCode
  try {
    const res = await fetch(
      `${AppConstants.AI_HORDE_PROD_URL}/api/v2/generate/check/${jobId}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
    )

    statusCode = res.status
    const data: HordeJobResponse | HordeErrorResponse = await res.json()

    if ('done' in data && 'is_possible' in data) {
      await debugSaveApiResponse(jobId, data, `/api/v2/generate/check/${jobId}`)
      return {
        success: true,
        ...data
      }
    } else {
      return {
        success: false,
        message: (data as HordeErrorResponse).message,
        statusCode
      }
    }
  } catch (err) {
    console.log(`Error: Unable to check status for jobId: ${jobId}`)
    console.log(err)

    return {
      success: false,
      statusCode: statusCode ?? 0,
      message: 'unknown error'
    }
  }
}

export default async function checkImage(
  jobId: string
): Promise<CheckSuccessResponse | CheckErrorResponse> {
  const queueSystem = getQueueSystem(jobId)

  console.log(`Enqueueing check task for jobId: ${jobId}`)
  return await queueSystem.enqueue(
    async () => {
      console.log(`Processing check task for jobId: ${jobId}`)
      const result = await performCheck(jobId)
      console.log(`Check task completed for jobId: ${jobId}`)
      return result
    },
    jobId // Use jobId as the unique taskId
  )
}
