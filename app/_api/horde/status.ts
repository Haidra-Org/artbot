import { AppConstants } from '@/app/_data-models/AppConstants'
import { clientHeader } from '@/app/_data-models/ClientHeader'
import { HordeJobResponse } from '@/app/_types/HordeTypes'
// import { debugSaveApiResponse } from '../artbot/debugSaveResponse'

interface HordeErrorResponse {
  message: string
}

export interface StatusSuccessResponse extends HordeJobResponse {
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
      `${AppConstants.AI_HORDE_PROD_URL}/api/v2/generate/status/${jobId}`,
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

    if ('done' in data) {
      // await debugSaveApiResponse(jobId, data, `/api/v2/generate/check/${jobId}`)

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
