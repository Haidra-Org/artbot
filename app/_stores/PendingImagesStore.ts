import { makeStore } from 'statery'
import { JobStatus } from '@/app/_types/ArtbotTypes'
import { ArtBotHordeJob } from '../_data-models/ArtBotHordeJob'

interface PendingImagesStoreInterface {
  completedJobsNotViewed: number
  pendingImages: ArtBotHordeJob[]
  pendingJobCompletedTimestamp: number
  pendingPageTimestamp: number
}

const initialState: PendingImagesStoreInterface = {
  completedJobsNotViewed: 0,
  pendingImages: [],
  pendingJobCompletedTimestamp: 0,
  pendingPageTimestamp: Date.now()
}

export const PendingImagesStore =
  makeStore<PendingImagesStoreInterface>(initialState)

export const updateCompletedJobInPendingImagesStore = () => {
  const isLargeScreen = window.innerWidth >= 768
  const isCreateOrPendingPage =
    window.location.pathname === '/create' ||
    window.location.pathname === '/pending'

  if (isLargeScreen && isCreateOrPendingPage) return

  PendingImagesStore.set((state) => ({
    ...state,
    completedJobsNotViewed: state.completedJobsNotViewed + 1,
    pendingJobCompletedTimestamp: Date.now()
  }))
}

export const viewedPendingPage = () => {
  PendingImagesStore.set((state) => ({
    ...state,
    completedJobsNotViewed: 0,
    pendingPageTimestamp: Date.now()
  }))
}

export const addPendingImageToAppState = (pendingJob: ArtBotHordeJob) => {
  PendingImagesStore.set((state) => ({
    ...state,
    pendingImages: [...state.pendingImages, pendingJob]
  }))
}

export const getPendingImageByIdFromAppState = (
  artbot_id: string
): ArtBotHordeJob | undefined =>
  PendingImagesStore.state.pendingImages.find(
    (job) => job.artbot_id === artbot_id
  )

export const getPendingImagesByStatusFromAppState = (
  status: JobStatus[]
): ArtBotHordeJob[] =>
  PendingImagesStore.state.pendingImages.filter((job) =>
    status.includes(job.status as JobStatus)
  )

export const deletePendingImageFromAppState = (artbot_id: string) => {
  PendingImagesStore.set((state) => ({
    ...state,
    pendingImages: state.pendingImages.filter(
      (job) => job.artbot_id !== artbot_id
    )
  }))
}

export const updatePendingImageInAppState = (
  artbot_id: string,
  updates: Partial<ArtBotHordeJob>
) => {
  PendingImagesStore.set((state) => ({
    ...state,
    pendingImages: state.pendingImages.map((job) => {
      if (job.artbot_id !== artbot_id) return job

      const updatedJob =
        job instanceof ArtBotHordeJob ? job : new ArtBotHordeJob(job)

      if (job.init_wait_time === 0 && updates.wait_time !== 0) {
        updates.init_wait_time = updates.wait_time
      }

      updatedJob.update(updates)
      return updatedJob
    })
  }))
}
