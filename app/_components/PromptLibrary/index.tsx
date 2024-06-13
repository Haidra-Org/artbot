import { getPromptHistoryFromDexie } from '@/app/_db/promptsHistory'
import { PromptsHistory } from '@/app/_types/ArtbotTypes'
import { useEffect, useState } from 'react'
import Button from '../Button'
import {
  IconCopy,
  IconCornerDownRight,
  IconHeart,
  IconTrash
} from '@tabler/icons-react'
import NiceModal from '@ebay/nice-modal-react'
import PromptHistoryCard from './PromptHistoryCard'

interface PromptLibraryProps {
  setPrompt?: (prompt: string) => void
  type?: 'prompt' | 'negative'
}
export default function PromptLibrary({
  type = 'prompt',
  setPrompt = () => {}
}: PromptLibraryProps) {
  const [prompts, setPrompts] = useState<PromptsHistory[]>([])

  useEffect(() => {
    async function getPrompts() {
      const data = await getPromptHistoryFromDexie(0, 20, 'prompt')
      console.log(`data?`, data)
      setPrompts(data)
    }

    getPrompts()
  }, [])

  return (
    <div className="col w-full h-full">
      <h2 className="row font-bold">Prompt Libary</h2>
      <div className="col gap-4">
        {prompts.map((prompt) => {
          return (
            <PromptHistoryCard
              key={prompt.artbot_id}
              prompt={prompt}
              setPrompt={setPrompt}
            />
          )
        })}
      </div>
    </div>
  )
}
