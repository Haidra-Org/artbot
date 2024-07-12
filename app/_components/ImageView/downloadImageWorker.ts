import { PNG } from 'pngjs'
import { Buffer } from 'buffer'
import { addMetadata } from 'meta-png'

type WorkerMessage = {
  imageBlob: Blob
  comment: string
}

self.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  const { imageBlob, comment } = e.data

  convertAndAddMetadata(imageBlob, comment)
    .then((pngBlob) => {
      ;(self as unknown as DedicatedWorkerGlobalScope).postMessage({ pngBlob })
    })
    .catch((error: Error) => {
      console.error(error)
      ;(self as unknown as DedicatedWorkerGlobalScope).postMessage({
        error: error.message
      })
    })
})

async function convertBlobToPngUint8Array(blob: Blob): Promise<Uint8Array> {
  const arrayBuffer = await blob.arrayBuffer()

  // Convert ArrayBuffer to Buffer
  const buffer = Buffer.from(arrayBuffer)

  // Use pngjs to read the PNG data
  const png = PNG.sync.read(buffer)

  // Convert the PNG data to a Uint8Array
  const pngUint8Array = new Uint8Array(PNG.sync.write(png))

  return pngUint8Array
}

async function convertAndAddMetadata(
  imageBufferArray: Blob
  // comment: string
): Promise<Blob | undefined> {
  try {
    const imageBlob = await convertBlob(imageBufferArray, 'image/png')
    const PNGUint8Array = await convertBlobToPngUint8Array(imageBlob)
    const updated = addMetadata(PNGUint8Array, 'foo', 'bar')
    return new Blob([updated], { type: 'image/png' })
  } catch (error) {
    console.error('Error in convertAndAddMetadata:', error)
  }
}

async function convertBlob(blob: Blob, mimeType: string): Promise<Blob> {
  if (blob.type === mimeType) {
    return blob
  }

  try {
    const imageBitmap = await createImageBitmap(blob)
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    ctx.drawImage(imageBitmap, 0, 0)
    return await canvas.convertToBlob({ type: mimeType, quality: 1 })
  } catch (error) {
    console.error('Error in convertBlob:', error)
    throw new Error('Failed to convert image: ' + (error as Error).message)
  }
}
