import {
  fetchPendingJobsByStatusFromDexie,
  updateHordeJobById
} from '@/app/_db/hordeJobs'
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests'
import { addImageAndDefaultFavToDexie } from '@/app/_db/jobTransactions'
import { HordeJob, ImageError, JobStatus } from '../_types/ArtbotTypes'
import {
  addPendingImageToAppState,
  getPendingImagesByStatusFromAppState,
  updateCompletedJobInPendingImagesStore,
  updatePendingImageInAppState
} from '../_stores/PendingImagesStore'
import { GenMetadata, HordeGeneration } from '../_types/HordeTypes'
import { checkImageExistsInDexie } from '../_db/ImageFiles'
import downloadImage, { DownloadSuccessResponse } from '../_api/horde/download'
import {
  ImageFileInterface,
  ImageStatus,
  ImageType
} from '../_data-models/ImageFile_Dexie'
import imageStatus, { StatusSuccessResponse } from '../_api/horde/status'
import { ImageParamsForHordeApi } from '../_data-models/ImageParamsForHordeApi'
import generateImage from '../_api/horde/generate'
import { sleep } from '../_utils/sleep'
import checkImage from '../_api/horde/check'
import { AppSettings } from '../_data-models/AppSettings'

const MAX_JOBS = 5

let pendingLastChecked = 0
let waitingLastChecked = 0

const waitingInterval = 2025
const pendingInterval = 6025

// Handles loading any pending images from Dexie on initial app load.
export const loadPendingImagesFromDexie = async () => {
  const jobs = await fetchPendingJobsByStatusFromDexie([
    JobStatus.Waiting,
    JobStatus.Queued,
    JobStatus.Requested,
    JobStatus.Processing,
    JobStatus.Error
  ])

  jobs.forEach((job) => {
    addPendingImageToAppState(job)
  })
}

/**
 * Update pending image in app state (for quick lookups) and in IndexedDB (persistent storage)
 * @param artbot_id
 * @param options
 */
export const updatePendingImage = async (
  artbot_id: string,
  options: Partial<HordeJob>
) => {
  updatePendingImageInAppState(artbot_id, {
    ...options
  })

  await updateHordeJobById(artbot_id, {
    ...options
  })
}

export const downloadImages = async ({
  jobDetails,
  generations,
  kudos
}: {
  jobDetails: HordeJob
  generations: HordeGeneration[]
  kudos: number
}) => {
  const downloadImagesPromise = []
  const generationsList: HordeGeneration[] = []

  let images_completed = 0
  let images_failed = 0

  const imageErrors: ImageError[] = []
  const gen_metadata: GenMetadata[] = []

  for (const generation of generations) {
    const exists = await checkImageExistsInDexie({ image_id: generation.id })

    if (!exists) {
      if (generation.censored) {
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
      } else {
        images_completed++
        gen_metadata.push(generation.gen_metadata as unknown as GenMetadata)
      }

      downloadImagesPromise.push(downloadImage(generation.img))
      generationsList.push(generation)
    } else {
      continue
    }
  }

  const results = await Promise.allSettled(downloadImagesPromise)

  for (let index = 0; index < results.length; index++) {
    const result = results[index]

    if (result.status === 'fulfilled') {
      const response = result.value as DownloadSuccessResponse
      const imageKudos = images_completed > 0 ? kudos / images_completed : 0

      const image: ImageFileInterface = {
        artbot_id: jobDetails.artbot_id,
        horde_id: jobDetails.horde_id,
        image_id: generationsList[index].id,
        imageType: ImageType.IMAGE,
        imageStatus: ImageStatus.OK, // TODO: FIXME: handle censored or errors.
        model: generationsList[index].model,
        imageBlob: response.blob,
        gen_metadata: generationsList[index].gen_metadata,
        seed: generationsList[index].seed,
        worker_id: generationsList[index].worker_id,
        worker_name: generationsList[index].worker_name,
        kudos: imageKudos.toFixed(2),
        apiResponse: JSON.stringify(generationsList[index])
      }

      if (response.success && !generations[index].censored) {
        // NOTE: We set favorite to false here so we can easily run a future query to find "all unfavorited images"
        await addImageAndDefaultFavToDexie(image)
      }
    }
  }

  let success = true

  await updatePendingImage(jobDetails.artbot_id, {
    images_completed,
    images_failed,
    errors: imageErrors,
    gen_metadata
  })

  if (jobDetails.images_requested === images_failed) {
    // TODO: Think about this -- maybe not auto delete failed jobs?
    // Let user decide what to do so they can re-roll / edit request.
    // await deleteJobFromDexie(jobDetails.artbot_id)
    success = false
  }

  return {
    success
  }
}

export const checkPendingJobs = async () => {
  // Return early if the function was called again too soon
  if (Date.now() - pendingLastChecked < pendingInterval) {
    return
  }

  const pendingJobs = getPendingImagesByStatusFromAppState([
    JobStatus.Queued,
    JobStatus.Processing
  ])

  if (pendingJobs.length === 0) {
    pendingLastChecked = 0
    return
  }

  pendingLastChecked = Date.now()

  const horde_ids = pendingJobs.map((job) => job.horde_id)
  const imageCheckPromises = horde_ids.map((id) => imageStatus(id))

  const results = await Promise.allSettled(imageCheckPromises)

  for (let index = 0; index < results.length; index++) {
    const result = results[index]

    if (result.status === 'fulfilled') {
      // Accessing the value property, which is a StatusSuccessResponse object
      const response = result.value as StatusSuccessResponse

      if ('statusCode' in response && response.statusCode === 429) {
        pendingLastChecked = Date.now() + 15000
        console.log(
          `Error: Too many requests for ${pendingJobs[index].artbot_id}`
        )
        return
      } else if (!response.success) {
        await updatePendingImage(pendingJobs[index].artbot_id, {
          status: JobStatus.Error,
          errors: [
            {
              type: 'other',
              message: response.message || ''
            }
          ]
        })
      } else if (response.done) {
        const { success } = await downloadImages({
          jobDetails: pendingJobs[index],
          generations: response.generations,
          kudos: response.kudos
        })

        await updatePendingImage(pendingJobs[index].artbot_id, {
          status: success ? JobStatus.Done : JobStatus.Error
        })

        updateCompletedJobInPendingImagesStore()
      } else {
        let status = JobStatus.Queued

        if (response.waiting >= 1) {
          // lol. this should NEVER be JobStatus.Waiting
          // because that is technically an "artbot" status
          // type, meaning, waiting to submit. TODO: FIXME:
          status = JobStatus.Queued
        }

        if (response.processing >= 1) {
          status = JobStatus.Processing
        }

        updatePendingImage(pendingJobs[index].artbot_id, {
          status,
          queue_position: response.queue_position,
          wait_time: response.wait_time
        })
      }
    } else {
      console.log(
        `Error checking image with ID ${horde_ids[index]}:`,
        result.reason
      )
    }
  }
}

export const checkForWaitingJobs = async () => {
  let pendingJobs = []

  // Return early if the function was called again too soon
  if (Date.now() - waitingLastChecked < waitingInterval) {
    return
  }

  pendingJobs = getPendingImagesByStatusFromAppState([
    JobStatus.Requested,
    JobStatus.Queued,
    JobStatus.Processing
  ])

  if (pendingJobs.length >= MAX_JOBS) {
    return
  }

  const [waitingJob] = getPendingImagesByStatusFromAppState([JobStatus.Waiting])

  if (!waitingJob) {
    waitingLastChecked = 0
    return
  }

  waitingLastChecked = Date.now()

  const [imageRequest] =
    (await getImageRequestsFromDexieById([waitingJob.artbot_id])) || []

  if (!imageRequest) return

  // Update to requested status so that we don't attempt to
  // fire off a duplicate request if API response takes a long time.
  await updatePendingImage(waitingJob.artbot_id, {
    status: JobStatus.Requested
  })

  const { apiParams } = await ImageParamsForHordeApi.build(imageRequest)

  const apiResponse = await generateImage(apiParams)

  if ('errors' in apiResponse) {
    await updatePendingImage(waitingJob.artbot_id, {
      status: JobStatus.Error,
      errors: [
        {
          type: 'other',
          message: apiResponse.message
        }
      ]
    })

    console.error(`Unknown API error: ${JSON.stringify(apiResponse)}`)
  }

  if ('id' in apiResponse) {
    // Artificial delay as Horde takes a moment to calculate processing times after requesting image.
    await sleep(750)
    const jobDetails = await checkImage(apiResponse.id)

    if ('wait_time' in jobDetails) {
      let status = JobStatus.Queued

      if (jobDetails.waiting >= 1) {
        // lol. this should NEVER be JobStatus.Waiting
        // because that is technically an "artbot" status
        // type, meaning, waiting to submit. TODO: FIXME:
        status = JobStatus.Queued
      }

      if (jobDetails.processing >= 1) {
        status = JobStatus.Processing
      }

      await updatePendingImage(waitingJob.artbot_id, {
        horde_id: apiResponse.id,
        init_wait_time: jobDetails.wait_time,
        status,
        wait_time: jobDetails.wait_time
      })
    }
  }
}

export const initJobController = () => {
  checkForWaitingJobs()
  checkPendingJobs()

  setInterval(() => {
    checkForWaitingJobs()
  }, 500)

  setInterval(() => {
    checkPendingJobs()
  }, 1000)
}
