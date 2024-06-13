import { getPromptHistoryFromDexie } from '@/app/_db/promptsHistory'
import { PromptsHistory } from '@/app/_types/ArtbotTypes'
import { useEffect, useState } from 'react'
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

  const title = type === 'prompt' ? 'Prompt Libary' : 'Negative Prompt Libary'

  return (
    <div className="col w-full h-full">
      <h2 className="row font-bold">{title}</h2>
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
