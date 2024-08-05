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

// Constants
const MAX_REQUESTS_PER_SECOND = 2
const REQUEST_INTERVAL = 1000 / MAX_REQUESTS_PER_SECOND
const CACHE_TIMEOUT = 750 // Time in ms before a job can be checked again
const PENDING_CHECK_INTERVAL = 1500 // Time in ms between checks of pending jobs
const ARTIFICIAL_DELAY = 50 // Delay in ms to prevent rate limiting and allow statusCache to update

// Request cache to manage API call frequency
const requestCache = new Map<string, number>()
let pendingLastChecked = 0

// Main function to check pending jobs
export const checkPendingJobs = async (): Promise<
  'skipped' | 'no_jobs' | 'processing'
> => {
  if (shouldSkipCheck()) return 'skipped'

  const pendingJobs = getPendingImagesByStatusFromAppState([
    JobStatus.Queued,
    JobStatus.Processing
  ])

  if (pendingJobs.length === 0) {
    resetPendingLastChecked()
    return 'no_jobs'
  }

  updatePendingLastChecked()

  const filteredHordeIds = getFilteredHordeIds(pendingJobs)
  const results = await checkImagesStatus(filteredHordeIds)

  await processResults(results, pendingJobs, filteredHordeIds)

  return 'processing'
}

const shouldSkipCheck = (): boolean =>
  Date.now() - pendingLastChecked < PENDING_CHECK_INTERVAL

const resetPendingLastChecked = (): void => {
  pendingLastChecked = 0
}

const updatePendingLastChecked = (): void => {
  pendingLastChecked = Date.now()
}

const getFilteredHordeIds = (pendingJobs: ArtBotHordeJob[]): string[] => {
  const hordeIds = pendingJobs.map((job) => job.horde_id)
  return hordeIds.filter((id) => {
    const lastChecked = requestCache.get(id)
    if (!lastChecked || Date.now() - lastChecked > REQUEST_INTERVAL) {
      requestCache.set(id, Date.now())
      return true
    }
    return false
  })
}

const checkImagesStatus = async (
  filteredHordeIds: string[]
): Promise<
  PromiseSettledResult<CheckSuccessResponse | CheckErrorResponse>[]
> => {
  const imageCheckPromises = filteredHordeIds.map((id) => checkImage(id))
  return Promise.allSettled(imageCheckPromises)
}

const processResults = async (
  results: PromiseSettledResult<CheckSuccessResponse | CheckErrorResponse>[],
  pendingJobs: ArtBotHordeJob[],
  filteredHordeIds: string[]
): Promise<void> => {
  for (let index = 0; index < results.length; index++) {
    const result = results[index]
    if (result.status === 'fulfilled') {
      await handleFulfilledResult(result.value, pendingJobs[index])
    } else {
      console.error(
        `Error checking image with ID ${filteredHordeIds[index]}:`,
        result.reason
      )
    }
    scheduleIdUnblocking(filteredHordeIds[index])
  }
}

const handleFulfilledResult = async (
  response: StatusSuccessResponse | CheckErrorResponse,
  job: ArtBotHordeJob
): Promise<void> => {
  if (isTooManyRequests(response)) {
    handleTooManyRequests()
    return
  }
  if (!isSuccessResponse(response)) {
    await handleErrorResponse(job, response)
  } else if (isJobFinished(response)) {
    await handleFinishedJob(job, response)
  } else {
    await handleOngoingJob(job, response)
  }
}

const isTooManyRequests = (
  response: StatusSuccessResponse | CheckErrorResponse
): boolean => 'statusCode' in response && response.statusCode === 429

const handleTooManyRequests = (): void => {
  pendingLastChecked = Date.now() + 15000
  console.warn('Error: Too many requests. Delaying next check.')
}

const isSuccessResponse = (
  response: StatusSuccessResponse | CheckErrorResponse
): response is StatusSuccessResponse =>
  'success' in response && response.success

const handleErrorResponse = async (
  job: ArtBotHordeJob,
  response: CheckErrorResponse
): Promise<void> => {
  await updatePendingImage(job.artbot_id, {
    status: JobStatus.Error,
    errors: [
      {
        type: 'other',
        message: response.message || 'Unknown error occurred'
      }
    ]
  })
  console.error(`Job error for ${job.artbot_id}:`, response.message)
}

const isJobFinished = (response: StatusSuccessResponse): boolean =>
  response.finished > 0 || response.done

const handleFinishedJob = async (
  job: ArtBotHordeJob,
  response: StatusSuccessResponse
): Promise<void> => {
  await sleep(ARTIFICIAL_DELAY)
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

const handleOngoingJob = async (
  job: ArtBotHordeJob,
  response: StatusSuccessResponse
): Promise<void> => {
  const status =
    response.processing >= 1 ? JobStatus.Processing : JobStatus.Queued

  updatePendingImage(job.artbot_id, {
    status,
    queue_position: response.queue_position,
    wait_time: response.wait_time,
    api_response: { ...response }
  })
}

const scheduleIdUnblocking = (id: string): void => {
  setTimeout(() => requestCache.delete(id), CACHE_TIMEOUT)
}
