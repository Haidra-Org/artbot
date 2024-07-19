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

const statusCache = new Map()

const shouldCheckStatus = (horde_id: string): boolean => {
  const lastChecked = statusCache.get(horde_id)
  return !(lastChecked && Date.now() - lastChecked < 6025)
}

const updateStatusCache = (horde_id: string): void => {
  statusCache.set(horde_id, Date.now())
}

const isValidResponse = (
  response: StatusSuccessResponse | StatusErrorResponse
): boolean => {
  if (response.success && 'generations' in response && response.generations) {
    return true
  }

  return false
}

const processImageGenerations = async ({
  generations = []
}: {
  generations: HordeGeneration[]
}) => {
  const gen_metadata: GenMetadata[] = []
  const imageErrors: ImageError[] = []
  let images_completed = 0
  let images_failed = 0
  const downloadImagesPromise = []
  const completedGenerations: HordeGeneration[] = []

  for (const generation of generations) {
    if (generation && generation.censored) {
      images_failed++

      if (!AppSettings.get('allowNsfwImages')) {
        imageErrors.push({
          type: 'nsfw',
          message: 'Image blocked due to user NSFW setting.'
        })
      } else {
        imageErrors.push({
          type: 'csam',
          message:
            'The GPU worker was unable to complete this request. Try again? (Error code: X)'
        })
      }

      continue
    }

    const exists = await checkImageExistsInDexie({ image_id: generation.id })

    if (!exists) {
      images_completed++
      gen_metadata.push(generation.gen_metadata as unknown as GenMetadata)

      downloadImagesPromise.push(downloadImage(generation.img))
      completedGenerations.push(generation)
    } else {
      continue
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

const handleSettledImageDownloads = async ({
  downloadImagesPromise,
  completedGenerations,
  images_completed,
  jobDetails,
  kudos
}: {
  downloadImagesPromise: Promise<
    DownloadSuccessResponse | DownloadErrorResponse
  >[]
  completedGenerations: HordeGeneration[]
  images_completed: number
  jobDetails: ArtBotHordeJob
  kudos: number
}) => {
  const results = await Promise.allSettled(downloadImagesPromise)

  for (let index = 0; index < results.length; index++) {
    const result = results[index]

    if (result.status === 'fulfilled') {
      const response = result.value as DownloadSuccessResponse
      const imageKudos = images_completed > 0 ? kudos / images_completed : 0

      const image: ImageFileInterface = {
        artbot_id: jobDetails.artbot_id,
        horde_id: jobDetails.horde_id,
        image_id: completedGenerations[index].id,
        imageType: ImageType.IMAGE,
        imageStatus: ImageStatus.OK, // TODO: FIXME: handle censored or errors.
        model: completedGenerations[index].model,
        imageBlobBuffer: response.blobBuffer,
        gen_metadata: completedGenerations[index].gen_metadata,
        seed: completedGenerations[index].seed,
        worker_id: completedGenerations[index].worker_id,
        worker_name: completedGenerations[index].worker_name,
        kudos: imageKudos.toFixed(2),
        apiResponse: JSON.stringify(completedGenerations[index])
      }

      if (response.success && !completedGenerations[index].censored) {
        // NOTE: We set favorite to false here so we can easily run a future query to find "all unfavorited images"
        await addImageAndDefaultFavToDexie(image)
      }
    }
  }
}

export const downloadImages = async ({
  jobDetails,
  kudos
}: {
  jobDetails: ArtBotHordeJob
  kudos: number
}) => {
  if (!shouldCheckStatus(jobDetails.horde_id)) {
    return { success: false }
  }

  updateStatusCache(jobDetails.horde_id)

  const response = await imageStatus(jobDetails.horde_id)
  if (!isValidResponse(response)) {
    return { success: false }
  }

  const generations =
    'generations' in response
      ? (response.generations as HordeGeneration[])
      : ([] as HordeGeneration[])

  const {
    completedGenerations,
    downloadImagesPromise,
    gen_metadata,
    imageErrors,
    images_completed,
    images_failed
  } = await processImageGenerations({
    generations
  })

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
    // @ts-expect-error TODO: FIXME: handle this properly
    api_response: { ...response }
  })
}
