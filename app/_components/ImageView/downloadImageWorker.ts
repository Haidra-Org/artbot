type WorkerMessage = {
  imageBlob: Blob
}

self.addEventListener('message', (e: MessageEvent<WorkerMessage>) => {
  const { imageBlob } = e.data

  convertAndAddMetadata(imageBlob)
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

async function convertAndAddMetadata(imageBlob: Blob): Promise<Blob> {
  try {
    return await convertBlob(imageBlob, 'image/png')
  } catch (error) {
    console.error('Error details:', error)
    throw new Error('Error processing image: ' + (error as Error).message)
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
