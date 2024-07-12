import { useEffect, useState } from 'react'
import { useStore } from 'statery'
import { PendingImagesStore } from '../_stores/PendingImagesStore'
import { deepEqual } from '../_utils/deepEqual'
import { ArtBotHordeJob } from '../_data-models/ArtBotHordeJob'

export const usePendingJob = (artbot_id: string) => {
  const { pendingImages } = useStore(PendingImagesStore)
  const [pendingJob, setPendingJob] = useState<ArtBotHordeJob>(
    {} as ArtBotHordeJob
  )

  useEffect(() => {
    const updatedJob =
      pendingImages.find((job) => job.artbot_id === artbot_id) ||
      ({} as ArtBotHordeJob)

    if (!deepEqual(updatedJob, pendingJob)) {
      setPendingJob(updatedJob)
      return
    }
  }, [artbot_id, pendingImages, pendingJob])

  return [pendingJob]
}
