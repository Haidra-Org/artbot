import { toastController } from '@/app/_controllers/toastController'
import {
  duplicateAndModifyArtbotId,
  getImagesForArtbotJobFromDexie
} from '@/app/_db/ImageFiles'
import { addPendingJobToDexie } from '@/app/_db/jobTransactions'
import { addPromptToDexie } from '@/app/_db/promptsHistory'
import usePromptInputValidation from '@/app/_hooks/usePromptInputValidation'
import { useInput } from '@/app/_providers/PromptInputProvider'
import { addPendingImageToAppState } from '@/app/_stores/PendingImagesStore'
import { useCallback, useEffect, useState } from 'react'

export default function useCreateImageRequest() {
  const { input } = useInput()
  const [errors, hasCriticalError] = usePromptInputValidation()
  const [requestPending, setRequestPending] = useState(false)

  const handleCreateClick = useCallback(async () => {
    const emptyInput = !input.prompt.trim() && !input.negative.trim()
    if (emptyInput) return
    if (emptyInput || requestPending || hasCriticalError) return

    setRequestPending(true)
    const pendingJob = await addPendingJobToDexie({ ...input })
    const uploadedImages = await getImagesForArtbotJobFromDexie(
      '__TEMP_USER_IMG_UPLOAD__'
    )

    if (uploadedImages && uploadedImages.length > 0) {
      await duplicateAndModifyArtbotId(
        '__TEMP_USER_IMG_UPLOAD__',
        pendingJob.artbot_id
      )
    }

    if (pendingJob) {
      addPendingImageToAppState(pendingJob)
    }

    await addPromptToDexie({
      artbot_id: pendingJob.artbot_id,
      prompt: input.prompt
    })
    setRequestPending(false)

    toastController({
      message: 'Image successfully requested!',
      type: 'success'
    })
  }, [hasCriticalError, input, requestPending])

  useEffect(() => {
    // Function to handle keydown events
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        handleCreateClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleCreateClick])

  const emptyInput = !input.prompt.trim() && !input.negative.trim()

  return {
    emptyInput,
    errors,
    handleCreateClick,
    hasCriticalError,
    requestPending
  }
}
