import PromptInput from '@/app/_data-models/PromptInput'
import { IconFileInfo, IconX } from '@tabler/icons-react'
import clsx from 'clsx'
import { useCallback, useState } from 'react'
import Section from '../../Section'
import LoraDetails from './LoraDetails'
import NiceModal from '@ebay/nice-modal-react'

interface LoraKeywordsProps {
  input: PromptInput
  setInput: React.Dispatch<Partial<PromptInput>>
}

export default function LoraKeywords({ input, setInput }: LoraKeywordsProps) {
  const [prompt, setPrompt] = useState(input.prompt)
  const [usedTags, setUsedTags] = useState<string[]>([])

  const onTagClick = useCallback(
    (tag: string) => {
      if (!usedTags.includes(tag)) {
        setUsedTags([...usedTags, tag])
        setPrompt(prompt + ', ' + tag)
        setInput({ prompt: prompt + ', ' + tag })
      } else {
        setUsedTags(usedTags.filter((t) => t !== tag))
        setPrompt(prompt.replace(`, ${tag}`, ''))
        setInput({ prompt: prompt.replace(`, ${tag}`, '') })
      }
    },
    [prompt, setInput, usedTags]
  )

  const loraTags = input.loras.reduce(
    (acc, embedding) => {
      if (!embedding || !embedding.modelVersions) return acc

      // Check if the embedding has any model versions and get the trainedWords from the first model version
      if (embedding.modelVersions.length > 0) {
        acc[embedding.name] = embedding.modelVersions[0].trainedWords
      } else {
        acc[embedding.name] = [] // If no model versions, return an empty array
      }
      return acc
    },
    {} as { [loraName: string]: string[] }
  )

  const tiTags = input.tis.reduce(
    (acc, embedding) => {
      if (!embedding || !embedding.modelVersions) return acc

      // Check if the embedding has any model versions and get the trainedWords from the first model version
      if (embedding.tags.length > 0) {
        acc[embedding.name] = embedding.tags
      } else {
        acc[embedding.name] = [] // If no model versions, return an empty array
      }
      return acc
    },
    {} as { [loraName: string]: string[] }
  )

  const tags = { ...loraTags, ...tiTags }

  const categories = Object.keys(tags)

  return (
    <div className="col w-full h-full">
      <h2 className="row font-bold">Keywords</h2>
      {usedTags.length > 0 && (
        <Section className="w-full col mb-4">
          <h3 className="font-[700] text-[16px]">Used tags</h3>
          <div className="row w-full gap-2 flex-wrap">
            {usedTags.map((tag) => {
              const active = usedTags.includes(tag)
              return (
                <div
                  key={`used_tag-${tag}`}
                  className={clsx(
                    'row gap-2 px-2 py-1 rounded hover:bg-[#14B8A6] cursor-pointer',
                    active ? 'bg-[#14B8A6]' : 'bg-zinc-400 dark:bg-zinc-700'
                  )}
                  onClick={() => onTagClick(tag)}
                >
                  {active && (
                    <div
                      className="row gap-0 items-center"
                      style={{
                        borderRight: '1px solid white',
                        paddingRight: '4px'
                      }}
                    >
                      <IconX size={16} />
                    </div>
                  )}
                  {tag}
                </div>
              )
            })}
          </div>
        </Section>
      )}
      {categories?.map((category) => (
        <div key={category} className="w-full col mb-4">
          <h3 className="font-[700] text-[16px] row gap-2">
            {category}
            <button
              onClick={() => {
                const obj = input.loras.filter(
                  (lora) => lora.name === category
                )[0]

                NiceModal.show('embeddingDetails', {
                  children: <LoraDetails details={obj} />
                })
              }}
              title="More information"
            >
              <IconFileInfo className="primary-color" />
            </button>
          </h3>
          <div className="row w-full gap-2 flex-wrap">
            {tags[category] &&
              tags[category]?.map((tag) => {
                const active = usedTags.includes(tag)
                return (
                  <div
                    key={`${category}-${tag}`}
                    className={clsx(
                      'row gap-2 px-2 py-1 rounded hover:bg-[#14B8A6] cursor-pointer',
                      active ? 'bg-[#14B8A6]' : 'bg-zinc-400 dark:bg-zinc-700'
                    )}
                    onClick={() => onTagClick(tag)}
                  >
                    {active && (
                      <div
                        className="row gap-0 items-center"
                        style={{
                          borderRight: '1px solid white',
                          paddingRight: '4px'
                        }}
                      >
                        <IconX size={16} />
                      </div>
                    )}
                    {tag}
                  </div>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}
