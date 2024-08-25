import { AppConstants } from '@/app/_data-models/AppConstants'
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests'
import { getPendingImagesByStatusFromAppState } from '@/app/_stores/PendingImagesStore'
import { ImageError, JobStatus } from '@/app/_types/ArtbotTypes'
import { ImageParamsForHordeApi } from '@/app/_data-models/ImageParamsForHordeApi'
import generateImage, { GenerateErrorResponse } from '@/app/_api/horde/generate'
import { sleep } from '@/app/_utils/sleep'
import checkImage from '@/app/_api/horde/check'
import { updatePendingImage } from './updatePendingImage'
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob'

const INITIAL_WAIT_TIME = 750

export const checkForWaitingJobs = async (): Promise<void> => {
  const pendingJobs = getPendingImagesByStatusFromAppState([
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

  await updatePendingImage(waitingJob.artbot_id, {
    status: JobStatus.Requested
  })

  try {
    const { apiParams } = await ImageParamsForHordeApi.build(imageRequest)
    const apiResponse = await generateImage(apiParams)

    if (!apiResponse || 'errors' in apiResponse) {
      await handleApiError(
        waitingJob.artbot_id,
        apiResponse || { errors: [{ error: 'unknown error' }] }
      )
      return
    }

    if ('id' in apiResponse) {
      await processSuccessfulResponse(waitingJob.artbot_id, apiResponse.id)
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    await updatePendingImage(waitingJob.artbot_id, {
      status: JobStatus.Error,
      errors: [{ type: 'other', message: 'Unexpected error occurred' }]
    })
  }
}

const handleApiError = async (
  jobId: string,
  apiResponse: GenerateErrorResponse
) => {
  const errorMessages: ImageError[] = []
  const hasErrors =
    'errors' in apiResponse && Object.keys(apiResponse.errors).length > 0

  // Add the main error message
  if (apiResponse.message && hasErrors) {
    errorMessages.push({ type: 'default', message: apiResponse.message })
  }

  // Add specific errors from the errors object
  if (apiResponse.errors && typeof apiResponse.errors === 'object') {
    Object.entries(apiResponse.errors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        errorMessages.push({ type: 'specific', field: key, message: value })
      } else {
        errorMessages.push({
          type: 'specific',
          field: key,
          message: JSON.stringify(value)
        })
      }
    })
  }

  // If no error fields were added, add a default 'other' error
  if (!hasErrors) {
    errorMessages.push({
      type: 'other',
      message: apiResponse.message || 'An unknown error occurred'
    })
  }

  await updatePendingImage(jobId, {
    status: JobStatus.Error,
    errors: errorMessages
  })

  console.error(`API error: ${JSON.stringify(apiResponse)}`)
}

const processSuccessfulResponse = async (jobId: string, hordeId: string) => {
  await sleep(INITIAL_WAIT_TIME)
  const jobDetails = await checkImage(hordeId)

  if ('is_possible' in jobDetails && !jobDetails.is_possible) {
    await handleImpossibleJob(
      jobId,
      hordeId,
      jobDetails as unknown as ArtBotHordeJob
    )
    return
  }

  if ('wait_time' in jobDetails) {
    await updateJobStatus(
      jobId,
      hordeId,
      jobDetails as unknown as ArtBotHordeJob
    )
  }
}

const handleImpossibleJob = async (
  jobId: string,
  hordeId: string,
  jobDetails: ArtBotHordeJob
) => {
  await updatePendingImage(jobId, {
    horde_id: hordeId,
    init_wait_time: jobDetails.wait_time,
    status: JobStatus.Error,
    jobErrorMessage:
      'There are currently no GPU workers that can complete this request. Try changing settings or try again later.',
    wait_time: jobDetails.wait_time,
    api_response: { ...jobDetails }
  })
}

const updateJobStatus = async (
  jobId: string,
  hordeId: string,
  jobDetails: ArtBotHordeJob
) => {
  let status = JobStatus.Queued

  if (jobDetails.processing >= 1) {
    status = JobStatus.Processing
  }

  await updatePendingImage(jobId, {
    horde_id: hordeId,
    init_wait_time: jobDetails.wait_time,
    status,
    wait_time: jobDetails.wait_time,
    api_response: { ...jobDetails }
  })
}
