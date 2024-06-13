import {
  IconCopy,
  IconCornerDownRight,
  IconHeart,
  IconTrash
} from '@tabler/icons-react'
import Button from '../Button'
import NiceModal from '@ebay/nice-modal-react'
import { PromptsHistory } from '@/app/_types/ArtbotTypes'
import { formatTimestamp } from '@/app/_utils/numberUtils'

export default function PromptHistoryCard({
  prompt,
  setPrompt
}: {
  prompt: PromptsHistory
  setPrompt: (prompt: string) => void
}) {
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
      <div className="row justify-between !items-end">
        <div
          style={{
            color: 'gray',
            display: 'flex',
            fontSize: '12px'
          }}
        >
          {formatTimestamp(prompt.timestamp)}
        </div>
        <div className="row">
          <Button onClick={() => {}} outline>
            <IconHeart />
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(prompt.prompt)
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
          <Button onClick={() => {}} theme="danger">
            <IconTrash />
          </Button>
        </div>
      </div>
    </div>
  )
}
