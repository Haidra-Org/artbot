import { AppConstants } from '@/app/_data-models/AppConstants'
import { AppSettings } from '@/app/_data-models/AppSettings'
import { clientHeader } from '@/app/_data-models/ClientHeader'
import { HordeApiParams } from '@/app/_data-models/ImageParamsForHordeApi'
// import { debugSaveApiResponse } from '../artbot/debugSaveResponse'
import throttle from '@/app/_utils/throttle'

export interface GenerateSuccessResponse {
  success: boolean
  id: string
  kudos: number
}

export interface GenerateErrorResponse {
  success: boolean
  errors: Array<{ [key: string]: string }>
  statusCode: number
  message: string
}

interface HordeSuccessResponse {
  id: string
  kudos: number
}

interface HordeErrorResponse {
  message: string
  errors: Array<{ [key: string]: string }>
}

async function generateImage(
  imageParams: HordeApiParams
): Promise<GenerateSuccessResponse | GenerateErrorResponse> {
  let statusCode
  try {
    const apikey =
      AppSettings.apikey()?.trim() || AppConstants.AI_HORDE_ANON_KEY
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
    )

    statusCode = res.status
    const data: HordeSuccessResponse | HordeErrorResponse = await res.json()

    if ('id' in data) {
      // await debugSaveApiResponse(
      //   data.id,
      //   { data, params: imageParams },
      //   `/api/v2/generate/async`
      // )
      return {
        success: true,
        ...data
      }
    } else {
      return {
        success: false,
        statusCode,
        errors: data.errors || [],
        message: data.message
      }
    }
  } catch (err) {
    console.log(`Error: Unable to send generate image request.`)
    console.log(err)

    return {
      success: false,
      statusCode: statusCode ?? 0,
      errors: [{ error: 'unknown error' }],
      message: 'unknown error'
    }
  }
}

// Export the throttled version as `generateImage`
export default throttle(generateImage, 600)
