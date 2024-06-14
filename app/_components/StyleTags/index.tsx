import { IconWand, IconX } from '@tabler/icons-react'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import Section from '../Section'
import { mergeArrays } from '@/app/_utils/arrayUtils'
import PromptInput from '@/app/_data-models/PromptInput'

interface Styles {
  [key: string]: string[]
}

interface StyleTagsProps {
  input: PromptInput
  setInput: React.Dispatch<Partial<PromptInput>>
}

export default function StyleTags({ input, setInput }: StyleTagsProps) {
  const [prompt, setPrompt] = useState(input.prompt)
  const [usedTags, setUsedTags] = useState<string[]>([])
  const [tags, setTags] = useState<Styles>({})

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

  useEffect(() => {
    async function fetchStyleTags() {
      const response = await fetch('/api/styles')
      const jsonReponse = await response.json()
      const { data } = jsonReponse

      if (data) {
        setTags(data)
      }
    }

    fetchStyleTags()
  }, [])

  useEffect(() => {
    const allTags = mergeArrays(tags)

    const foundTags = allTags.filter((tag) => prompt.includes(tag))
    setUsedTags(foundTags)
  }, [prompt, tags])

  const categories = Object.keys(tags)

  return (
    <>
      <div className="col w-full h-full">
        <h2 className="row font-bold">Styles</h2>
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
        {categories.map((category) => (
          <div key={category} className="w-full col mb-4">
            <h3 className="font-[700] text-[16px] row gap-2">
              {category}
              <button
                onClick={() => {
                  const filterStyles = tags[category].filter(
                    (tag) => !usedTags.includes(tag)
                  )
                  const randomStyle =
                    filterStyles[
                      Math.floor(Math.random() * filterStyles.length)
                    ]

                  if (!randomStyle) {
                    return
                  }

                  onTagClick(randomStyle)
                }}
                title="Select random style"
              >
                <IconWand className="primary-color" />
              </button>
            </h3>
            <div className="row w-full gap-2 flex-wrap">
              {tags[category].map((tag) => {
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
    </>
  )
}
