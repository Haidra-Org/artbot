// import { Store } from 'react-notifications-component'
import { getImageRequestsFromDexieById } from '../_db/imageRequests'
import { addPendingImageToAppState } from '../_stores/PendingImagesStore'
import { toastController } from '../_controllers/toastController'
import { db } from '../_db/dexie'
import { ImageType } from '../_data-models/ImageFile_Dexie'
import { nanoid } from 'nanoid'
import { ImageRequest, JobStatus } from '../_types/ArtbotTypes'
import { cloneImageRowsInDexie } from '../_db/ImageFiles'
import { cleanImageRequestForReuse } from '../_utils/inputUtils'
import { AppConstants } from '../_data-models/AppConstants'
import { ArtBotHordeJob } from '../_data-models/ArtBotHordeJob'

export default function useRerollImage() {
  const rerollImage = async (artbot_id: string) => {
    return await db
      .transaction(
        'rw',
        [
          db.imageFiles,
          db.imageRequests,
          db.hordeJobs,
          db.promptsHistory,
          db.promptsJobMap
        ],
        async () => {
          const data = await getImageRequestsFromDexieById([artbot_id])

          if (!data || data.length === 0) {
            return
          }

          const [imageRequest] = data as ImageRequest[]
          const updatedImageRequest = cleanImageRequestForReuse(imageRequest, {
            artbot_id: nanoid(AppConstants.NANO_ID_LENGTH),
            numImages: 1
          })

          const job = new ArtBotHordeJob({
            artbot_id: updatedImageRequest.artbot_id,
            job_id: nanoid(AppConstants.NANO_ID_LENGTH),
            horde_id: '',
            created_timestamp: Date.now(),
            horde_completed_timestamp: 0,
            horde_received_timestamp: 0,
            updated_timestamp: Date.now(),
            status: JobStatus.Waiting,
            queue_position: null,
            init_wait_time: null,
            wait_time: null,
            images_requested: 1,
            images_completed: 0,
            images_failed: 0,
            height: updatedImageRequest.height,
            width: updatedImageRequest.width
          })

          // Iterate through existingImageSources array using for of.
          await cloneImageRowsInDexie(
            artbot_id,
            updatedImageRequest.artbot_id,
            ImageType.SOURCE
          )

          // Add pending job to database
          await db.hordeJobs.add(job)
          await db.imageRequests.add(updatedImageRequest)

          // Add pending job to app state
          addPendingImageToAppState(job)

          toastController({
            // message: 'Re-rolled! Creating new image request.',
            message: <span>Re-rolled! Creating new image request.</span>,
            type: 'success'
          })
        }
      )
      .catch((err) => {
        console.error('Transaction failed: ', err)
        toastController({
          message: `Unable to re-roll image. ${err}`,
          type: 'error'
        })
      })
  }

  return [rerollImage]
}
