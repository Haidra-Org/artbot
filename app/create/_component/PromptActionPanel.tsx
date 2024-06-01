'use client'

import Button from '@/app/_components/Button'
import PromptInput from '@/app/_data-models/PromptInput'
import usePromptInputValidation from '@/app/_hooks/usePromptInputValidation'
import { useInput } from '@/app/_providers/PromptInputProvider'
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

    setTimeout(async () => {
      setRequestPending(false)
    }, 2000)
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
