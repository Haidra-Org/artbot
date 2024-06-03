import { useEffect, useState } from 'react'
import { useStore } from 'statery'
import { HordeJob } from '../_types/ArtbotTypes'
import { PendingImagesStore } from '../_stores/PendingImagesStore'
import { deepEqual } from '../_utils/deepEqual'

export const usePendingJob = (artbot_id: string) => {
  const { pendingImages } = useStore(PendingImagesStore)
  const [pendingJob, setPendingJob] = useState<HordeJob>({} as HordeJob)

  useEffect(() => {
    const updatedJob =
      pendingImages.find((job) => job.artbot_id === artbot_id) ||
      ({} as HordeJob)

    if (!deepEqual(updatedJob, pendingJob)) {
      setPendingJob(updatedJob)
      return
    }
  }, [artbot_id, pendingImages, pendingJob])

  return [pendingJob]
}
