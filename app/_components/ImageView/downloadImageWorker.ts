import { PNG } from 'pngjs'
import { Buffer } from 'buffer'
import { addMetadata } from 'meta-png'
import { ImageMetaData } from '@/app/_types/ArtbotTypes'

type WorkerMessage = {
  imageBlob: Blob
  metadata: ImageMetaData
}

self.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  const { imageBlob, metadata } = e.data

  convertAndAddMetadata(imageBlob, metadata)
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
  imageBufferArray: Blob,
  metadata: ImageMetaData = {} as ImageMetaData
): Promise<Blob | undefined> {
  try {
    const imageBlob = await convertBlob(imageBufferArray, 'image/png')
    const PNGUint8Array = await convertBlobToPngUint8Array(imageBlob)

    let updatedPNGUint8Array = PNGUint8Array

    Object.keys(metadata).forEach((key) => {
      if (!key) return

      if (key in metadata) {
        const metadataValue = metadata[key as keyof ImageMetaData] ?? ''
        updatedPNGUint8Array = addMetadata(
          updatedPNGUint8Array,
          key,
          // @ts-expect-error Not sure why this won't validate in TypeScript, but we should be fine here.
          metadata[metadataValue]
        )
      }
    })

    updatedPNGUint8Array = addMetadata(
      updatedPNGUint8Array,
      'Software',
      'ArtBot for Stable Diffusion | tinybots.net/artbot'
    )

    return new Blob([updatedPNGUint8Array], { type: 'image/png' })
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
