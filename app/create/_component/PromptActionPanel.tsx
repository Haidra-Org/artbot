'use client'

import Button from '@/app/_components/Button'
import DeleteConfirmation from '@/app/_components/Modal_DeleteConfirmation'
import PromptWarning from '@/app/_components/PromptWarning'
import PromptInput from '@/app/_data-models/PromptInput'
import { deleteImageFileByArtbotIdTx } from '@/app/_db/ImageFiles'
import { useInput } from '@/app/_providers/PromptInputProvider'
import NiceModal from '@ebay/nice-modal-react'
import {
  IconHourglass,
  IconInfoTriangle,
  IconSquarePlus,
  IconTrash
} from '@tabler/icons-react'
import { useRouter } from 'next/navigation'
import useCreateImageRequest from '../_hook/useCreateImageRequest'
import clsx from 'clsx'
import { AppConstants } from '@/app/_data-models/AppConstants'

export default function PromptActionPanel({
  height = 36,
  isSticky = false
}: {
  height?: number
  isSticky?: boolean
}) {
  const { kudos, setInput, setSourceImages } = useInput()
  const {
    emptyInput,
    errors,
    handleCreateClick,
    hasCriticalError,
    requestPending
  } = useCreateImageRequest()
  const router = useRouter()

  return (
    <div className={clsx('row w-full', !isSticky && 'justify-between')}>
      {!isSticky && kudos > 0 && (
        <div className="text-sm font-mono">({kudos} kudos)</div>
      )}
      {!isSticky && kudos === 0 && <div></div>}
      <div className={clsx('row', isSticky && 'w-full')}>
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
                    await deleteImageFileByArtbotIdTx(
                      AppConstants.IMAGE_UPLOAD_TEMP_ID
                    )
                    setSourceImages([])
                    window.scrollTo(0, 0)

                    // Strip hash off URL if it exists.
                    router.push('/create')

                    // For now, just close modal on delete
                    NiceModal.remove('modal')
                  }}
                />
              )
            })
          }}
          style={{
            height: `${height}px`,
            width: isSticky ? '25%' : `88px`
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
          style={{
            height: `${height}px`,
            width: isSticky ? '75%' : `88px`
          }}
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
                {isSticky && kudos > 0 ? <span>({kudos} kudos)</span> : ''}
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
            style={{
              height: `${height}px`
            }}
          >
            <span className="row gap-1">
              <IconInfoTriangle stroke={1.5} />
              {hasCriticalError ? 'Error' : 'Warning'}
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
