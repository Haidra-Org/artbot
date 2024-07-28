import { AppConstants } from '@/app/_data-models/AppConstants'
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests'
import { getPendingImagesByStatusFromAppState } from '@/app/_stores/PendingImagesStore'
import { JobStatus } from '@/app/_types/ArtbotTypes'
import { ImageParamsForHordeApi } from '@/app/_data-models/ImageParamsForHordeApi'
import generateImage from '@/app/_api/horde/generate'
import { sleep } from '@/app/_utils/sleep'
import checkImage from '@/app/_api/horde/check'
import { updatePendingImage } from './updatePendingImage'

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

    if ('is_possible' in jobDetails && !jobDetails.is_possible) {
      await updatePendingImage(waitingJob.artbot_id, {
        horde_id: apiResponse.id,
        init_wait_time: jobDetails.wait_time,
        status: JobStatus.Error,
        jobErrorMessage:
          'There are currently no GPU workers that can complete this requst. Try changing settings or try again later.',
        wait_time: jobDetails.wait_time,
        api_response: { ...jobDetails }
      })

      return
    }

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
