import { nanoid } from 'nanoid'
import { ImageBlobBuffer } from '../_data-models/ImageFile_Dexie'
import { isSafariBrowser, isiOS } from './browserUtils'

function URI2Blob(dataURI: string, mimeType: string): Blob {
  const imageBytes = atob(dataURI.split(',')[1])

  const arrayBuf = new ArrayBuffer(imageBytes.length)
  const intArr = new Uint8Array(arrayBuf)
  for (let i = 0; i < imageBytes.length; i++) {
    intArr[i] = imageBytes.charCodeAt(i)
  }

  return new Blob([intArr], { type: mimeType })
}

function loadImage(src: string) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      resolve(image)
    }
    image.onerror = (error) => {
      reject(error)
    }
    image.src = src
  })
}

function createTempCanvas() {
  const canvas = document.createElement('CANVAS')
  canvas.style.display = 'none'
  return canvas
}

async function convertBlob(
  blob: Blob,
  mimeType: string,
  callback: (arg0: Blob) => void
  // exif: object = {}
) {
  let convertedBlob: Blob
  if (blob.type !== mimeType) {
    const image = (await loadImage(
      URL.createObjectURL(blob)
    )) as HTMLImageElement
    const canvas = <HTMLCanvasElement>createTempCanvas()
    const ctx = canvas.getContext('2d')

    canvas.width = image.width
    canvas.height = image.height

    if (ctx) {
      ctx.drawImage(image, 0, 0)
    }

    convertedBlob = URI2Blob(canvas.toDataURL(mimeType, 1), mimeType)
  } else {
    convertedBlob = blob
  }

  const result = convertedBlob
  // const result = await writeMetadata(convertedBlob, exif)

  if (callback) {
    callback(result)
  } else {
    return result
  }
}

export const initBlob = () => {
  if (!Blob.prototype.toPNG) {
    Blob.prototype.toPNG = async function (callback: () => void) {
      // Converting through canvas will remove exif data
      // So extract exif first, and then add it back when creating new blob
      // const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/png', callback)
    }
  }

  if (!Blob.prototype.toWebP) {
    Blob.prototype.toWebP = async function (callback: () => void) {
      // const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/webp', callback)
    }
  }

  if (!Blob.prototype.toJPEG) {
    Blob.prototype.toJPEG = async function (callback: () => void) {
      // const exif = await getExifFromBlob(this)
      return await convertBlob(this, 'image/jpeg', callback)
    }
  }

  if (!Blob.prototype.addOrUpdateExifData) {
    Blob.prototype.addOrUpdateExifData = async function () {
      return this
    }

    // Blob.prototype.addOrUpdateExifData = async function (userComment: string) {
    //   return await writeMetadata(this, mergeExifData({}, userComment))
    // }
  }
}

export const bufferToBlob = (buffer: ImageBlobBuffer) => {
  return new Blob([buffer.arrayBuffer], { type: buffer.type })
}

export const base64toBlob = async (base64Data: string) => {
  try {
    const base64str = `data:${inferMimeTypeFromBase64(
      base64Data
    )};base64,${base64Data}`
    const base64Response = await fetch(base64str)
    const blob = await base64Response.blob()

    return blob
  } catch (err) {
    console.log(`Error: Unable to convert base64 to Blob`, err)
    return false
  }
}

export interface BlobToBase64Options {
  stripMetadata?: boolean
}

export function blobToBase64(
  blob: Blob,
  options: BlobToBase64Options = {
    stripMetadata: true
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = function () {
      if (reader.result) {
        if (options.stripMetadata) {
          return resolve((reader.result as string).split(',')[1] as string)
        }

        resolve(reader.result as string)
      } else {
        const err = new Error('Failed to convert blob to base64')
        console.error(err)
        reject(err)
      }
    }
    reader.onerror = function (error) {
      reject(error)
    }
    reader.readAsDataURL(blob)
  })
}

export const cropToNearest64 = (
  base64str: string
): Promise<{
  croppedBase64: string
  newWidth: number
  newHeight: number
}> => {
  return new Promise((resolve, reject) => {
    base64str = `data:${inferMimeTypeFromBase64(base64str)};base64,${base64str}`

    // Create a new image element
    const img = new Image()
    img.onload = function () {
      // Create a canvas element
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Calculate the new dimensions divisible by 64
      const newWidth = img.width - (img.width % 64)
      const newHeight = img.height - (img.height % 64)

      // Calculate the starting position to keep the image centered
      const startX = (img.width - newWidth) / 2
      const startY = (img.height - newHeight) / 2

      // Set the canvas dimensions and draw the cropped image
      canvas.width = newWidth
      canvas.height = newHeight
      ctx?.drawImage(
        img,
        startX,
        startY,
        newWidth,
        newHeight,
        0,
        0,
        newWidth,
        newHeight
      )

      // Convert the canvas back to base64 string
      const croppedBase64 = canvas.toDataURL()
      const [, imgBase64String] = croppedBase64.split(';base64,')

      // Return the cropped base64 string, new width, and new height via callback
      resolve({ croppedBase64: imgBase64String, newWidth, newHeight })
    }
    img.onerror = reject
    img.src = base64str
  })
}

export const getBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      return resolve(reader.result as string)
    }
  })
}

export const blobToArrayBuffer = async (blob: Blob) => {
  const arrayBuffer = await blob.arrayBuffer()
  return {
    arrayBuffer,
    type: blob.type,
    size: blob.size,
    id: nanoid(6)
  }
}

export const inferMimeTypeFromBase64 = (base64: string) => {
  if (base64.indexOf('data:') === 0) {
    let [data] = base64?.split(',') || ['']
    data = data.replace('data:', '')
    data = data.replace(';base64', '')
    return data
  }

  // Convert base64 string to array of integers
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)

  // Check the bytes to identify the format
  if (byteArray[0] === 0xff && byteArray[1] === 0xd8 && byteArray[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    byteArray[0] === 0x89 &&
    byteArray[1] === 0x50 &&
    byteArray[2] === 0x4e &&
    byteArray[3] === 0x47
  ) {
    return 'image/png'
  }
  if (byteArray[0] === 0x47 && byteArray[1] === 0x49 && byteArray[2] === 0x46) {
    return 'image/gif'
  }
  if (byteArray[0] === 0x42 && byteArray[1] === 0x4d) {
    return 'image/bmp'
  }
  if (
    byteArray[0] === 0x38 &&
    byteArray[1] === 0x42 &&
    byteArray[2] === 0x50 &&
    byteArray[3] === 0x53
  ) {
    return 'image/psd'
  }
  if (
    byteArray[0] === 0x52 &&
    byteArray[1] === 0x49 &&
    byteArray[2] === 0x46 &&
    byteArray[3] === 0x46 &&
    byteArray[8] === 0x57 &&
    byteArray[9] === 0x45 &&
    byteArray[10] === 0x42 &&
    byteArray[11] === 0x50
  ) {
    return 'image/webp'
  }

  return 'unknown'
}

export const nearestWholeMultiple = (input: number, X = 64) => {
  let output = Math.round(input / X)
  if (output === 0 && input > 0) {
    output += 1
  }

  output *= X

  return output
}

export const blobToClipboard = async (imageBlobBuffer: ImageBlobBuffer) => {
  initBlob()

  const imageBlob = bufferToBlob(imageBlobBuffer)

  const makeImagePromiseForSafari = async () => {
    return await imageBlob.toPNG()
  }

  if (isiOS() || isSafariBrowser()) {
    try {
      const imagePromise = await makeImagePromiseForSafari()

      if (imagePromise) {
        navigator.clipboard.write([
          new ClipboardItem({
            'image/png': imagePromise
          })
        ])

        return true
      }
    } catch (err) {
      return false
    }
  } else {
    // Only PNGs can be copied to the clipboard
    const newBlob = await imageBlob.toPNG()

    if (newBlob) {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': newBlob })])
      return true
    }
  }
}
