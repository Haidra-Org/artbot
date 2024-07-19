import { fetchPendingJobsByStatusFromDexie } from '@/app/_db/hordeJobs'
import { addPendingImageToAppState } from '@/app/_stores/PendingImagesStore'
import { JobStatus } from '@/app/_types/ArtbotTypes'

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
