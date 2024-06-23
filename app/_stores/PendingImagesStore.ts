import { makeStore } from 'statery'
import { HordeJob, JobStatus } from '@/app/_types/ArtbotTypes'

interface PendingImagesStoreInterface {
  completedJobsNotViewed: number
  pendingImages: HordeJob[]
  pendingJobCompletedTimestamp: number
  pendingPageTimestamp: number
}

export const PendingImagesStore = makeStore<PendingImagesStoreInterface>({
  completedJobsNotViewed: 0,
  pendingImages: [],
  pendingJobCompletedTimestamp: 0,
  pendingPageTimestamp: Date.now()
})

export const updateCompletedJobInPendingImagesStore = () => {
  // In this instance, the user is on a larger screen device and can see the pending images panel.
  if (
    (window.innerWidth >= 768 && window.location.pathname === '/create') ||
    window.location.pathname === '/pending'
  ) {
    return
  }

  PendingImagesStore.set((state) => ({
    completedJobsNotViewed: state.completedJobsNotViewed + 1,
    pendingJobCompletedTimestamp: Date.now()
  }))
}

export const viewedPendingPage = () => {
  PendingImagesStore.set(() => ({
    completedJobsNotViewed: 0,
    pendingPageTimestamp: Date.now()
  }))
}

export const addPendingImageToAppState = (pendingJob: HordeJob) => {
  PendingImagesStore.set((state) => ({
    pendingImages: [...state.pendingImages, pendingJob]
  }))
}

export const getPendingImageByIdFromAppState = (arbot_id: string) => {
  const [jobDetails] =
    PendingImagesStore.state.pendingImages.filter(
      (job) => job.artbot_id === arbot_id
    ) || {}

  return jobDetails as HordeJob
}

export const getPendingImagesByStatusFromAppState = (status: JobStatus[]) => {
  return PendingImagesStore.state.pendingImages.filter((job) =>
    status.includes(job.status as JobStatus)
  )
}

export const deletePendingImageFromAppState = (artbot_id: string) => {
  PendingImagesStore.set((state) => ({
    pendingImages: state.pendingImages.filter(
      (job) => job.artbot_id !== artbot_id
    )
  }))
}

export const updatePendingImageInAppState = (
  artbot_id: string,
  updates: Partial<HordeJob>
) => {
  PendingImagesStore.set((state) => {
    // Map through the existing pendingImages to find and update the relevant item
    const updatedPendingImages = state.pendingImages.map((job) => {
      if (job.artbot_id === artbot_id) {
        // Fix issue where init_wait_time might be set to 0.
        if (job.init_wait_time === 0 && updates.wait_time !== 0) {
          updates.init_wait_time = updates.wait_time
        }

        // Found the job to update, apply the updates to it
        return { ...job, ...updates }
      }
      // Not the job we're interested in, leave it as is
      return job
    })

    // Return the new state with updated pendingImages
    return { pendingImages: updatedPendingImages }
  })
}
