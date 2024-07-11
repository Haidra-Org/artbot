import { makeStore } from 'statery'
import { JobStatus } from '@/app/_types/ArtbotTypes'
import { ArtBotHordeJob } from '../_data-models/ArtBotHordeJob'

interface PendingImagesStoreInterface {
  completedJobsNotViewed: number
  pendingImages: ArtBotHordeJob[]
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

export const addPendingImageToAppState = (pendingJob: ArtBotHordeJob) => {
  PendingImagesStore.set((state) => ({
    pendingImages: [...state.pendingImages, pendingJob]
  }))
}

export const getPendingImageByIdFromAppState = (arbot_id: string) => {
  const [jobDetails] =
    PendingImagesStore.state.pendingImages.filter(
      (job) => job.artbot_id === arbot_id
    ) || {}

  return jobDetails as ArtBotHordeJob
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
  updates: Partial<ArtBotHordeJob>
) => {
  PendingImagesStore.set((state) => {
    const updatedPendingImages = state.pendingImages.map((job) => {
      if (job.artbot_id === artbot_id) {
        // Fix issue where init_wait_time might be set to 0.
        if (job.init_wait_time === 0 && updates.wait_time !== 0) {
          updates.init_wait_time = updates.wait_time
        }

        // Check if job already exists and is an instance of ArtBotHordeJob
        if (job instanceof ArtBotHordeJob) {
          job.update(updates)
          return job
        } else {
          return new ArtBotHordeJob({ ...(job as ArtBotHordeJob), ...updates })
        }
      }
      return job
    })

    // Return the new state with updated pendingImages
    return { ...state, pendingImages: updatedPendingImages }
  })
}
