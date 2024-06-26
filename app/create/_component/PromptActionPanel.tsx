'use client'

import Button from '@/app/_components/Button'
import DeleteConfirmation from '@/app/_components/Modal_DeleteConfirmation'
import PromptWarning from '@/app/_components/PromptWarning'
import { toastController } from '@/app/_controllers/toastController'
import PromptInput from '@/app/_data-models/PromptInput'
import {
  deleteImageFileByArtbotIdTx,
  duplicateAndModifyArtbotId,
  getImagesForArtbotJobFromDexie
} from '@/app/_db/ImageFiles'
import { addPendingJobToDexie } from '@/app/_db/jobTransactions'
import { addPromptToDexie } from '@/app/_db/promptsHistory'
import usePromptInputValidation from '@/app/_hooks/usePromptInputValidation'
import { useInput } from '@/app/_providers/PromptInputProvider'
import { addPendingImageToAppState } from '@/app/_stores/PendingImagesStore'
import NiceModal from '@ebay/nice-modal-react'
import {
  IconHourglass,
  IconInfoTriangle,
  IconSquarePlus,
  IconTrash
} from '@tabler/icons-react'
import { useCallback, useEffect, useState } from 'react'

export default function PromptActionPanel() {
  const { input, setInput, setSourceImages } = useInput()
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

  return (
    <div className="row w-full justify-end">
      <Button
        theme="danger"
        onClick={async () => {
          NiceModal.show('delete', {
            children: (
              <DeleteConfirmation
                deleteButtonTitle="Reset"
                title="Reset prompt?"
                message={
                  <>
                    <p>
                      Are you sure you want to reset all image generation
                      settings to their default values?
                    </p>
                    <p>This cannot be undone.</p>
                  </>
                }
                onDelete={async () => {
                  setInput({ ...new PromptInput() })
                  await deleteImageFileByArtbotIdTx('__TEMP_USER_IMG_UPLOAD__')
                  setSourceImages([])
                  window.scrollTo(0, 0)

                  // For now, just close modal on delete
                  NiceModal.remove('modal')
                }}
              />
            )
          })
        }}
      >
        <span className="row gap-1">
          <IconTrash stroke={1.5} />
          Reset?
        </span>
      </Button>

      <Button
        disabled={emptyInput || requestPending || hasCriticalError}
        onClick={handleCreateClick}
        title={
          hasCriticalError
            ? 'Please fix errors before creating'
            : 'Send image request to the AI Horde'
        }
      >
        <span className="row gap-1">
          {requestPending ? (
            <>
              <IconHourglass />
              Sending...
            </>
          ) : (
            <>
              <IconSquarePlus stroke={1.5} />
              Create
            </>
          )}
        </span>
      </Button>
      {errors.length > 0 && (
        <Button
          theme="warning"
          onClick={() => {
            NiceModal.show('modal', {
              children: <PromptWarning errors={errors} />
            })
          }}
        >
          <span className="row gap-1">
            <IconInfoTriangle stroke={1.5} />
            {hasCriticalError ? 'Error' : 'Warning'}
          </span>
        </Button>
      )}
    </div>
  )
}
