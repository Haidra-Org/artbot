import {
  IconCopy,
  IconCornerDownRight,
  IconHeart,
  IconHeartFilled,
  IconTrash
} from '@tabler/icons-react'
import Button from '../Button'
import NiceModal from '@ebay/nice-modal-react'
import { PromptsHistory } from '@/app/_types/ArtbotTypes'
import { formatTimestamp } from '@/app/_utils/numberUtils'
import { toastController } from '@/app/_controllers/toastController'
import { useState } from 'react'
import {
  deletePromptFromDexie,
  updateFavoritePrompt
} from '@/app/_db/promptsHistory'
import DeleteConfirmation from '../Modal_DeleteConfirmation'

export default function PromptHistoryCard({
  onDelete = () => {},
  prompt,
  setPrompt
}: {
  onDelete?: () => void
  prompt: PromptsHistory
  setPrompt: (prompt: string) => void
}) {
  const [isFavorite, setIsFavorite] = useState(prompt.favorited ? true : false)
  const suggested = prompt.artbot_id === '_suggestion'

  return (
    <div
      className="col gap-2"
      style={{
        border: '1px solid #7e5a6c',
        borderRadius: '4px',
        padding: '8px'
      }}
    >
      {prompt.prompt}
      <div className="row justify-between items-end!">
        <div
          style={{
            color: 'gray',
            display: 'flex',
            fontSize: '12px'
          }}
        >
          {!suggested ? formatTimestamp(prompt.timestamp) : ''}
        </div>
        <div className="row">
          {!suggested && (
            <Button
              onClick={() => {
                const updatedStatus = !isFavorite
                setIsFavorite(updatedStatus)
                updateFavoritePrompt(prompt.id as number, updatedStatus)
              }}
              outline
            >
              {isFavorite ? <IconHeartFilled color={'red'} /> : <IconHeart />}
            </Button>
          )}
          <Button
            onClick={() => {
              navigator.clipboard.writeText(prompt.prompt)
              toastController({
                message: 'Prompt copied to clipboard!'
              })
            }}
          >
            <IconCopy />
          </Button>
          <Button
            onClick={() => {
              setPrompt(prompt.prompt)
              NiceModal.remove('modal')
            }}
          >
            <IconCornerDownRight />
          </Button>
          {!suggested && (
            <Button
              onClick={() => {
                NiceModal.show('delete', {
                  children: (
                    <DeleteConfirmation
                      deleteButtonTitle="Delete"
                      title="Delete prompt?"
                      message={
                        <div className="col gap-4">
                          <p>
                            Are you sure you want to delete this prompt from
                            your prompt library?
                          </p>
                          <p>This cannot be undone.</p>
                          <p>NOTE: No images will be harmed in this process.</p>
                        </div>
                      }
                      onDelete={async () => {
                        await deletePromptFromDexie(prompt.id as number)
                        await onDelete()
                        toastController({
                          message: 'Prompt deleted!',
                          type: 'success'
                        })
                      }}
                    />
                  )
                })
              }}
              theme="danger"
            >
              <IconTrash />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
