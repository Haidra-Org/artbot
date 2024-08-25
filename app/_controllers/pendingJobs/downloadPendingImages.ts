import downloadImage, {
  DownloadErrorResponse,
  DownloadSuccessResponse
} from '@/app/_api/horde/download'
import imageStatus, {
  StatusErrorResponse,
  StatusSuccessResponse
} from '@/app/_api/horde/status'
import { AppSettings } from '@/app/_data-models/AppSettings'
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob'
import {
  ImageFileInterface,
  ImageStatus,
  ImageType
} from '@/app/_data-models/ImageFile_Dexie'
import { checkImageExistsInDexie } from '@/app/_db/ImageFiles'
import { addImageAndDefaultFavToDexie } from '@/app/_db/jobTransactions'
import { ImageError } from '@/app/_types/ArtbotTypes'
import { GenMetadata, HordeGeneration } from '@/app/_types/HordeTypes'
import { updatePendingImage } from './updatePendingImage'
import { fetchJobByArtbotId } from '@/app/_db/hordeJobs'
import throttle from '@/app/_utils/throttle'

const STATUS_CHECK_INTERVAL = 6025 // ms

const throttledFunctions = new Map<string, ReturnType<typeof throttle>>()

const getThrottledFunction = (
  hordeId: string,
  jobDetails: ArtBotHordeJob,
  kudos: number
) => {
  if (!throttledFunctions.has(hordeId)) {
    const throttledFn = throttle(async () => {
      const response = await imageStatus(hordeId)
      if (!isValidResponse(response) || !response.generations) {
        return { success: false }
      }

      const {
        completedGenerations,
        downloadImagesPromise,
        gen_metadata,
        imageErrors,
        images_completed,
        images_failed
      } = await processImageGenerations(
        jobDetails.artbot_id,
        response.generations
      )

      await handleSettledImageDownloads({
        downloadImagesPromise,
        completedGenerations,
        images_completed,
        jobDetails,
        kudos
      })

      await updatePendingImage(jobDetails.artbot_id, {
        images_completed,
        images_failed,
        errors: imageErrors,
        gen_metadata,
        api_response: response
      })

      return { success: true }
    }, STATUS_CHECK_INTERVAL)
    throttledFunctions.set(hordeId, throttledFn)
  }
  return throttledFunctions.get(hordeId)!
}

const isValidResponse = (
  response: StatusSuccessResponse | StatusErrorResponse
): response is StatusSuccessResponse => {
  return (
    response.success &&
    'generations' in response &&
    Array.isArray(response.generations)
  )
}

const handleCensoredImage = (allowNsfw: boolean): ImageError => {
  if (!allowNsfw) {
    return { type: 'nsfw', message: 'Image blocked due to user NSFW setting.' }
  }
  return {
    type: 'csam',
    message:
      'The GPU worker was unable to complete this request. Try again? (Error code: X)'
  }
}

const processImageGenerations = async (
  jobId: string,
  generations: HordeGeneration[]
): Promise<{
  completedGenerations: HordeGeneration[]
  downloadImagesPromise: Promise<
    DownloadSuccessResponse | DownloadErrorResponse | null
  >[]
  gen_metadata: GenMetadata[]
  imageErrors: ImageError[]
  images_completed: number
  images_failed: number
}> => {
  const gen_metadata: GenMetadata[] = []
  const imageErrors: ImageError[] = []

  const jobDetails = (await fetchJobByArtbotId(jobId)) || ({} as ArtBotHordeJob)

  let images_completed = jobDetails.images_completed || 0
  let images_failed = jobDetails.images_failed || 0
  console.log(`process jobDetails`, {
    id: jobId,
    images_completed: jobDetails.images_completed,
    images_failed: jobDetails.images_failed
  })

  const downloadImagesPromise: Promise<
    DownloadSuccessResponse | DownloadErrorResponse | null
  >[] = []
  const completedGenerations: HordeGeneration[] = []

  const allowNsfw = AppSettings.get('allowNsfwImages')

  for (const generation of generations) {
    if (generation.censored) {
      images_failed++
      imageErrors.push(handleCensoredImage(allowNsfw))
      completedGenerations.push(generation)
      downloadImagesPromise.push(Promise.resolve(null)) // Add a placeholder for censored images
    } else {
      const exists = await checkImageExistsInDexie({ image_id: generation.id })
      if (!exists) {
        images_completed++
        gen_metadata.push(generation.gen_metadata as unknown as GenMetadata)
        downloadImagesPromise.push(downloadImage(generation.img))
        completedGenerations.push(generation)
      } else {
        // Handle case for existing images
        completedGenerations.push(generation)
        downloadImagesPromise.push(Promise.resolve(null)) // Add a placeholder for existing images
      }
    }
  }

  return {
    completedGenerations,
    downloadImagesPromise,
    gen_metadata,
    imageErrors,
    images_completed,
    images_failed
  }
}

const createImageFile = (
  jobDetails: ArtBotHordeJob,
  generation: HordeGeneration,
  response: DownloadSuccessResponse,
  imageKudos: number
): ImageFileInterface => ({
  artbot_id: jobDetails.artbot_id,
  horde_id: jobDetails.horde_id,
  image_id: generation.id,
  imageType: ImageType.IMAGE,
  imageStatus: ImageStatus.OK,
  model: generation.model,
  imageBlobBuffer: response.blobBuffer,
  gen_metadata: generation.gen_metadata,
  seed: generation.seed,
  worker_id: generation.worker_id,
  worker_name: generation.worker_name,
  kudos: imageKudos.toFixed(2),
  apiResponse: JSON.stringify(generation)
})

const handleSettledImageDownloads = async (params: {
  downloadImagesPromise: Promise<
    DownloadSuccessResponse | DownloadErrorResponse | null
  >[]
  completedGenerations: HordeGeneration[]
  images_completed: number
  jobDetails: ArtBotHordeJob
  kudos: number
}): Promise<void> => {
  const {
    downloadImagesPromise,
    completedGenerations,
    images_completed,
    jobDetails,
    kudos
  } = params
  const results = await Promise.allSettled(downloadImagesPromise)
  const imageKudos = images_completed > 0 ? kudos / images_completed : 0

  for (let index = 0; index < results.length; index++) {
    const result = results[index]
    if (
      result.status === 'fulfilled' &&
      result.value &&
      'success' in result.value &&
      result.value.success &&
      'blobBuffer' in result.value &&
      !completedGenerations[index].censored
    ) {
      const image = createImageFile(
        jobDetails,
        completedGenerations[index],
        result.value as DownloadSuccessResponse,
        imageKudos
      )
      await addImageAndDefaultFavToDexie(image)
    }
  }
}

export const downloadImages = async ({
  jobDetails,
  kudos
}: {
  jobDetails: ArtBotHordeJob
  kudos: number
}): Promise<{ success: boolean }> => {
  const throttledFn = getThrottledFunction(
    jobDetails.horde_id,
    jobDetails,
    kudos
  )
  return throttledFn()
}
