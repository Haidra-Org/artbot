// Not really a Horde specific API endpoint, but this
// downloads images returned from the Horde.

import { ImageBlobBuffer } from '@/app/_data-models/ImageFile_Dexie'
import { blobToArrayBuffer } from '@/app/_utils/imageUtils'

export interface DownloadSuccessResponse {
  success: boolean
  blobBuffer: ImageBlobBuffer
}
export interface DownloadErrorResponse {
  success: boolean
  statusCode: number
  message: string
  details?: string
}

/**
 * Downloads an image from a remote API endpoint.
 *
 * @param imgUrl - The URL of the image to download.
 * @returns A promise that resolves to a DownloadSuccessResponse on success
 *          or a DownloadErrorResponse on failure.
 */
export default async function downloadImage(
  imgUrl: string
): Promise<DownloadSuccessResponse | DownloadErrorResponse> {
  try {
    const imageData = await fetch(imgUrl)

    if (!imageData.ok) {
      return {
        success: false,
        statusCode: imageData.status,
        message: `http error ${imageData.status}`,
        details: `HTTP error: ${imageData.status} - ${imageData.statusText}`
      }
    }

    const blob = await imageData.blob()
    const blobBuffer = await blobToArrayBuffer(blob)

    return {
      success: true,
      blobBuffer
    }
  } catch (err) {
    const error = err as Error
    console.log(`Error attempting to download image: ${imgUrl}`)
    console.log(err)
    return {
      success: false,
      statusCode: 0,
      message: 'unknown error',
      details: error.message || error.toString()
    }
  }
}
