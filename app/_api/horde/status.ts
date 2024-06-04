import { clientHeader } from '@/app/_data-models/ClientHeader'
import { HordeGeneration } from '@/app/_types/HordeTypes'

interface HordeSuccessResponse {
  generations: HordeGeneration[]
  shared: boolean
  finished: number
  processing: number
  restarted: number
  waiting: number
  done: boolean
  faulted: boolean
  wait_time: number
  queue_position: number
  kudos: number
  is_possible: boolean
}

interface HordeErrorResponse {
  message: string
}

export interface StatusSuccessResponse extends HordeSuccessResponse {
  success: boolean
  message?: string
}

export interface StatusErrorResponse extends HordeErrorResponse {
  success: boolean
  statusCode: number
}

export default async function imageStatus(
  jobId: string
): Promise<StatusSuccessResponse | StatusErrorResponse> {
  let statusCode

  if (!jobId) {
    return {
      success: false,
      statusCode: 400,
      message: 'jobId is required'
    }
  }

  try {
    const res = await fetch(
      `https://aihorde.net/api/v2/generate/status/${jobId}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
    )

    statusCode = res.status
    const data: HordeSuccessResponse | HordeErrorResponse = await res.json()

    if ('done' in data) {
      return {
        success: true,
        ...data
      }
    } else {
      return {
        success: false,
        statusCode,
        ...data
      }
    }
  } catch (err) {
    console.log(`Error: Unable to download images for jobId: ${jobId}`)
    console.log(err)

    return {
      success: false,
      statusCode: statusCode ?? 0,
      message: 'unknown error'
    }
  }
}
