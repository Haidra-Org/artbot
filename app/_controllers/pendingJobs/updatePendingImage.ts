import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob'
import { updateHordeJobById } from '@/app/_db/hordeJobs'
import {
  getPendingImageByIdFromAppState,
  updatePendingImageInAppState
} from '@/app/_stores/PendingImagesStore'
import { JobStatus } from '@/app/_types/ArtbotTypes'

/**
 * Update pending image in app state (for quick lookups) and in IndexedDB (persistent storage)
 * @param artbot_id
 * @param options
 */
export const updatePendingImage = async (
  artbot_id: string,
  options: Partial<ArtBotHordeJob>
) => {
  const pendingImageDataToUpdate = getPendingImageByIdFromAppState(artbot_id)

  // Add a null check here
  if (pendingImageDataToUpdate) {
    if (
      options.status &&
      options.status === JobStatus.Queued &&
      !pendingImageDataToUpdate.horde_received_timestamp
    ) {
      options.horde_received_timestamp = Date.now()
    }

    if (
      options.status &&
      options.status === JobStatus.Done &&
      !pendingImageDataToUpdate.horde_completed_timestamp
    ) {
      options.horde_completed_timestamp = Date.now()
    }

    if (options.wait_time) {
      // If init_wait_time is null or the new wait_time is greater, update init_wait_time
      if (
        pendingImageDataToUpdate.init_wait_time === null ||
        options.wait_time > pendingImageDataToUpdate.init_wait_time
      ) {
        options.init_wait_time = options.wait_time
      }
    }

    // IndexedDb update should run first before app state update
    // Due to cascading affect on PendingImagesPanel
    await updateHordeJobById(artbot_id, {
      ...options
    })

    updatePendingImageInAppState(artbot_id, {
      ...options
    })
  } else {
    console.error(`No pending image found with id: ${artbot_id}`)
    // You might want to handle this case differently depending on your application's needs
  }
}
