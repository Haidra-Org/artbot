import {
  fetchPendingJobsByStatusFromDexie,
  updateHordeJobById
} from '@/app/_db/hordeJobs'
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests'
import { addImageAndDefaultFavToDexie } from '@/app/_db/jobTransactions'
import { ImageError, JobStatus } from '../_types/ArtbotTypes'
import {
  addPendingImageToAppState,
  getPendingImageByIdFromAppState,
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
import { AppConstants } from '../_data-models/AppConstants'
import { ArtBotHordeJob } from '../_data-models/ArtBotHordeJob'

const MAX_REQUESTS_PER_SECOND = 2
const REQUEST_INTERVAL = 1000 / MAX_REQUESTS_PER_SECOND
const CACHE_TIMEOUT = 750

const requestCache = new Map()
const statusCache = new Map()

let pendingLastChecked = 0
const pendingInterval = 1500

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
  options: Partial<ArtBotHordeJob>
) => {
  const pendingImageDataToUpdate = getPendingImageByIdFromAppState(artbot_id)

  if (
    options.status &&
    options.status === JobStatus.Queued &&
    !pendingImageDataToUpdate.horde_received_timestamp
  ) {
    options.horde_received_timestamp = Date.now()
  }

  if (
    options.status &&
    options.status === JobStatus.Done &&
    !pendingImageDataToUpdate.horde_completed_timestamp
  ) {
    options.horde_completed_timestamp = Date.now()
  }

  if (options.wait_time) {
    // If init_wait_time is null or the new wait_time is greater, update init_wait_time
    if (
      pendingImageDataToUpdate.init_wait_time === null ||
      options.wait_time > pendingImageDataToUpdate.init_wait_time
    ) {
      options.init_wait_time = options.wait_time
    }
  }

  // IndexedDb update should run first before app state update
  // Due to cascading affect on PendingImagesPanel
  await updateHordeJobById(artbot_id, {
    ...options
  })

  updatePendingImageInAppState(artbot_id, {
    ...options
  })
}

export const downloadImages = async ({
  jobDetails,
  kudos
}: {
  jobDetails: ArtBotHordeJob
  kudos: number
}) => {
  const downloadImagesPromise = []
  const generationsList: HordeGeneration[] = []

  let images_completed = 0
  let images_failed = 0

  const imageErrors: ImageError[] = []
  const gen_metadata: GenMetadata[] = []

  const lastChecked = statusCache.get(jobDetails.horde_id)
  if (lastChecked && Date.now() - lastChecked < 6025) {
    return { success: false }
  }

  if (!lastChecked || Date.now() - lastChecked > 6025) {
    statusCache.set(jobDetails.horde_id, Date.now())
  }

  const response = await imageStatus(jobDetails.horde_id)

  if (
    !response.success ||
    !('generations' in response) ||
    !response.generations
  ) {
    return { success: false }
  }

  const generations = response.generations

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
        imageBlobBuffer: response.blobBuffer,
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
    gen_metadata,
    api_response: { ...response }
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

  const filteredHordeIds = horde_ids.filter((id) => {
    const lastChecked = requestCache.get(id)
    if (!lastChecked || Date.now() - lastChecked > REQUEST_INTERVAL) {
      requestCache.set(id, Date.now())
      return true
    }
    return false
  })

  const imageCheckPromises = filteredHordeIds.map((id) => checkImage(id))

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
      } else if (response.finished > 0 || response.done) {
        // Artificial delay to prevent rate limiting and allow statusCache to update
        await sleep(50)
        await downloadImages({
          jobDetails: pendingJobs[index],
          kudos: response.kudos
        })

        if (response.done) {
          const success =
            pendingJobs[index].images_requested !==
            pendingJobs[index].images_failed

          await updatePendingImage(pendingJobs[index].artbot_id, {
            status: success ? JobStatus.Done : JobStatus.Error,
            images_completed: response.finished
          })
          updateCompletedJobInPendingImagesStore()
        } else {
          updatePendingImage(pendingJobs[index].artbot_id, {
            queue_position: response.queue_position,
            wait_time: response.wait_time,
            images_completed: response.finished,
            api_response: { ...response }
          })
        }
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
          wait_time: response.wait_time,
          api_response: { ...response }
        })
      }
    } else {
      console.log(
        `Error checking image with ID ${horde_ids[index]}:`,
        result.reason
      )
    }

    // Schedule unblocking of the ID
    setTimeout(
      () => requestCache.delete(filteredHordeIds[index]),
      CACHE_TIMEOUT
    )
  }
}

export const checkForWaitingJobs = async () => {
  let pendingJobs = []

  pendingJobs = getPendingImagesByStatusFromAppState([
    JobStatus.Requested,
    JobStatus.Queued,
    JobStatus.Processing
  ])

  if (pendingJobs.length >= AppConstants.MAX_CONCURRENT_JOBS) {
    return
  }

  const [waitingJob] = getPendingImagesByStatusFromAppState([JobStatus.Waiting])

  if (!waitingJob) {
    return
  }

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
        wait_time: jobDetails.wait_time,
        api_response: { ...jobDetails }
      })
    }
  }
}

export const initJobController = () => {
  checkForWaitingJobs()
  checkPendingJobs()

  setInterval(() => {
    checkForWaitingJobs()
  }, 2050)

  setInterval(() => {
    checkPendingJobs()
  }, 2000)
}
