'use client'

import Button from '@/app/_components/Button'
import PromptInput from '@/app/_data-models/PromptInput'
import {
  duplicateAndModifyArtbotId,
  getImagesForArtbotJobFromDexie
} from '@/app/_db/ImageFiles'
import { addPendingJobToDexie } from '@/app/_db/jobTransactions'
import { addPromptToDexie } from '@/app/_db/promptsHistory'
import usePromptInputValidation from '@/app/_hooks/usePromptInputValidation'
import { useInput } from '@/app/_providers/PromptInputProvider'
import { addPendingImageToAppState } from '@/app/_stores/PendingImagesStore'
import {
  IconHourglass,
  IconInfoTriangle,
  IconSquarePlus,
  IconTrash
} from '@tabler/icons-react'
import { useCallback, useState } from 'react'

export default function PromptActionPanel() {
  const { input, setInput, setSourceImages } = useInput()
  const [errors, hasCriticalError] = usePromptInputValidation()
  const [requestPending, setRequestPending] = useState(false)

  const handleCreateClick = useCallback(async () => {
    if (input.prompt.trim() === '') return

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

    await addPromptToDexie(pendingJob.artbot_id, input.prompt)
    setRequestPending(false)
  }, [input])

  const emptyInput = !input.prompt.trim() && !input.negative.trim()

  return (
    <div className="row w-full justify-end">
      <Button
        theme="danger"
        onClick={async () => {
          setInput({ ...new PromptInput() })
          // await deleteImageFileByArtbotIdTx('__TEMP_USER_IMG_UPLOAD__')
          setSourceImages([])
          window.scrollTo(0, 0)
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
        <Button theme="warning" onClick={() => {}}>
          <span className="row gap-1">
            <IconInfoTriangle stroke={1.5} />
            {hasCriticalError ? 'Error' : 'Warning'}
          </span>
        </Button>
      )}
    </div>
  )
}
