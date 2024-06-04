// import { Store } from 'react-notifications-component'
import { addPromptToDexie } from '../_db/PromptsHistory'
import { getImageRequestsFromDexieById } from '../_db/imageRequests'
import { addPendingJobToDexie } from '../_db/jobTransactions'
import { addPendingImageToAppState } from '../_stores/PendingImagesStore'

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

    await addPromptToDexie(pendingJob.artbot_id, imageRequest.prompt)

    // TODO: Add a temporary job ID so images can be associated with previous job?
    // TODO: Need to check for / handle image uploads

    // Store.addNotification({
    //   title: 'Re-roll Success!',
    //   message: 'Created new image request.',
    //   type: 'success',
    //   insert: 'top',
    //   container: 'top-right',
    //   dismiss: {
    //     duration: 2500,
    //     showIcon: true,
    //     onScreen: true
    //   }
    // })
  }

  return [rerollImage]
}
