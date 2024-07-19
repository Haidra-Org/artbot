import { JobStatus } from '@/app/_types/ArtbotTypes'
import { StatusSuccessResponse } from '@/app/_api/horde/status'
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob'
import {
  getPendingImagesByStatusFromAppState,
  updateCompletedJobInPendingImagesStore
} from '@/app/_stores/PendingImagesStore'
import { sleep } from '@/app/_utils/sleep'
import checkImage, {
  CheckErrorResponse,
  CheckSuccessResponse
} from '@/app/_api/horde/check'
import { downloadImages } from './downloadPendingImages'
import { updatePendingImage } from './updatePendingImage'

const MAX_REQUESTS_PER_SECOND = 2
const REQUEST_INTERVAL = 1000 / MAX_REQUESTS_PER_SECOND
const CACHE_TIMEOUT = 750
const requestCache = new Map()
let pendingLastChecked = 0
const pendingInterval = 1500

// Main function to check pending jobs
export const checkPendingJobs = async () => {
  if (shouldSkipCheck()) return

  const pendingJobs = getPendingImagesByStatusFromAppState([
    JobStatus.Queued,
    JobStatus.Processing
  ])

  if (pendingJobs.length === 0) {
    resetPendingLastChecked()
    return
  }

  updatePendingLastChecked()

  const filteredHordeIds = getFilteredHordeIds(pendingJobs)
  const results = await checkImagesStatus(filteredHordeIds)

  await processResults(results, pendingJobs, filteredHordeIds)
}

// Helper function to determine if we should skip the check
const shouldSkipCheck = () => Date.now() - pendingLastChecked < pendingInterval

// Reset the last checked time
const resetPendingLastChecked = () => {
  pendingLastChecked = 0
}

// Update the last checked time
const updatePendingLastChecked = () => {
  pendingLastChecked = Date.now()
}

// Filter Horde IDs based on the request cache
const getFilteredHordeIds = (pendingJobs: ArtBotHordeJob[]): string[] => {
  const horde_ids = pendingJobs.map((job) => job.horde_id)
  return horde_ids.filter((id) => {
    const lastChecked = requestCache.get(id)
    if (!lastChecked || Date.now() - lastChecked > REQUEST_INTERVAL) {
      requestCache.set(id, Date.now())
      return true
    }
    return false
  })
}

// Check the status of multiple images
const checkImagesStatus = async (filteredHordeIds: string[]) => {
  const imageCheckPromises = filteredHordeIds.map((id) => checkImage(id))
  return Promise.allSettled(imageCheckPromises)
}

// Process the results of image status checks
const processResults = async (
  results: PromiseSettledResult<CheckSuccessResponse | CheckErrorResponse>[],
  pendingJobs: ArtBotHordeJob[],
  filteredHordeIds: string[]
) => {
  for (let index = 0; index < results.length; index++) {
    const result = results[index]
    if (result.status === 'fulfilled') {
      // @ts-expect-error - result.value will be CheckSuccessResponse or CheckErrorResponse
      await handleFulfilledResult(result.value, pendingJobs[index])
    } else {
      console.log(
        `Error checking image with ID ${filteredHordeIds[index]}:`,
        result.reason
      )
    }
    scheduleIdUnblocking(filteredHordeIds[index])
  }
}

// Handle a successful response from the image status check
const handleFulfilledResult = async (
  response: StatusSuccessResponse,
  job: ArtBotHordeJob
) => {
  if (isTooManyRequests(response)) {
    handleTooManyRequests(job)
    return
  }
  if (!response.success) {
    await handleErrorResponse(job, response)
  } else if (isJobFinished(response)) {
    await handleFinishedJob(job, response)
  } else {
    await handleOngoingJob(job, response)
  }
}

// Check if the response indicates too many requests
const isTooManyRequests = (response: StatusSuccessResponse): boolean =>
  'statusCode' in response && response.statusCode === 429

// Handle the case of too many requests
const handleTooManyRequests = (job: ArtBotHordeJob) => {
  pendingLastChecked = Date.now() + 15000
  console.log(`Error: Too many requests for ${job.artbot_id}`)
}

// Handle an error response
const handleErrorResponse = async (
  job: ArtBotHordeJob,
  response: StatusSuccessResponse
) => {
  await updatePendingImage(job.artbot_id, {
    status: JobStatus.Error,
    errors: [
      {
        type: 'other',
        message: response.message || ''
      }
    ]
  })
}

// Check if the job is finished
const isJobFinished = (response: StatusSuccessResponse): boolean =>
  response.finished > 0 || response.done

// Handle a finished job
const handleFinishedJob = async (
  job: ArtBotHordeJob,
  response: StatusSuccessResponse
) => {
  // Artificial delay to prevent rate limiting and allow statusCache to update
  await sleep(50)
  await downloadImages({
    jobDetails: job,
    kudos: response.kudos
  })

  if (response.done) {
    const success = job.images_requested !== job.images_failed
    await updatePendingImage(job.artbot_id, {
      status: success ? JobStatus.Done : JobStatus.Error,
      images_completed: response.finished
    })
    updateCompletedJobInPendingImagesStore()
  } else {
    updatePendingImage(job.artbot_id, {
      queue_position: response.queue_position,
      wait_time: response.wait_time,
      images_completed: response.finished,
      api_response: { ...response }
    })
  }
}

// Handle an ongoing job
const handleOngoingJob = async (
  job: ArtBotHordeJob,
  response: StatusSuccessResponse
) => {
  let status = JobStatus.Queued

  if (response.processing >= 1) {
    status = JobStatus.Processing
  }

  updatePendingImage(job.artbot_id, {
    status,
    queue_position: response.queue_position,
    wait_time: response.wait_time,
    api_response: { ...response }
  })
}

// Schedule the unblocking of an ID in the request cache
const scheduleIdUnblocking = (id: string) => {
  setTimeout(() => requestCache.delete(id), CACHE_TIMEOUT)
}
