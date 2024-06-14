// import { Store } from 'react-notifications-component'
import { addPromptToDexie } from '../_db/promptsHistory'
import { getImageRequestsFromDexieById } from '../_db/imageRequests'
import { addPendingJobToDexie } from '../_db/jobTransactions'
import { addPendingImageToAppState } from '../_stores/PendingImagesStore'
import { toastController } from '../_controllers/toastController'

export default function useRerollImage() {
  const rerollImage = async (artbot_id: string) => {
    const data = await getImageRequestsFromDexieById([artbot_id])

    if (!data) {
      return
    }

    const [imageRequest] = data

    // Remove / update fields for re-roll
    // @ts-expect-error Clearing field for new job
    delete imageRequest.id
    // @ts-expect-error Clearing field for new job
    delete imageRequest.artbot_id
    // @ts-expect-error Clearing field for new job
    delete imageRequest.seed
    imageRequest.numImages = 1

    // Clones behavior in imageActionPanel
    // TODO: Turn into a hook?
    const pendingJob = await addPendingJobToDexie({ ...imageRequest })

    if (pendingJob) {
      addPendingImageToAppState(pendingJob)
    }

    await addPromptToDexie({
      artbot_id: pendingJob.artbot_id,
      prompt: imageRequest.prompt
    })

    toastController({
      message: 'Re-rolled! Creating new image request.',
      type: 'success'
    })

    // TODO: Add a temporary job ID so images can be associated with previous job?
    // TODO: Need to check for / handle image uploads
  }

  return [rerollImage]
}
