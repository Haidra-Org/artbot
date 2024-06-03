import { makeStore } from 'statery'
import { HordeJob, JobStatus } from '@/app/_types/ArtbotTypes'

interface PendingImagesStoreInterface {
  pendingImages: HordeJob[]
}

export const PendingImagesStore = makeStore<PendingImagesStoreInterface>({
  pendingImages: []
})

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
