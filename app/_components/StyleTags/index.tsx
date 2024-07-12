import { IconArrowBarLeft, IconWand, IconX } from '@tabler/icons-react'
import clsx from 'clsx'
import { useCallback, useEffect, useState } from 'react'
import Section from '../Section'
import { mergeArrays } from '@/app/_utils/arrayUtils'
import PromptInput from '@/app/_data-models/PromptInput'
import Button from '../Button'
import { appBasepath } from '@/app/_utils/browserUtils'

interface JsonData {
  [key: string]: string[]
}

interface Styles {
  [key: string]: string[]
}

interface StyleTagsProps {
  input: PromptInput
  setInput: React.Dispatch<Partial<PromptInput>>
}

const filterJsonBySearch = (
  tags: JsonData | undefined,
  searchInput: string | undefined
): JsonData => {
  // Check if the tags object is valid; if not, return an empty object
  if (!tags || typeof tags !== 'object') {
    return {}
  }

  // If searchInput is not provided, return the original tags object
  if (!searchInput) {
    return tags
  }

  // Convert searchInput to lowercase for case-insensitive matching
  const lowerCaseSearch = searchInput.toLowerCase()

  // Initialize an object to hold the filtered result
  const filteredTags: JsonData = {}

  // Iterate through each key in the JSON object
  Object.keys(tags).forEach((key) => {
    // Check if the current value is an array
    if (Array.isArray(tags[key])) {
      // Filter the array of strings to include only those that match the search term
      const filteredArray = tags[key].filter((item) =>
        item.toLowerCase().includes(lowerCaseSearch)
      )

      // If the filtered array is not empty, add it to the filteredTags object
      if (filteredArray.length > 0) {
        filteredTags[key] = filteredArray
      }
    }
  })

  return filteredTags
}

export default function StyleTags({ input, setInput }: StyleTagsProps) {
  const [searchInput, setSearchInput] = useState('')
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
      const response = await fetch(`${appBasepath()}/api/styles`)
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

  const filteredTags = filterJsonBySearch(tags, searchInput)
  const categories = Object.keys(filteredTags)

  return (
    <>
      <div className="col w-full h-full">
        <h2 className="row font-bold">Tags</h2>
        <div className="row w-full mb-2">
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Filter styles"
            onChange={(e) => {
              setSearchInput(e.target.value)
            }}
            value={searchInput}
          />
          <Button
            theme="danger"
            onClick={() => {
              setSearchInput('')
            }}
          >
            <IconArrowBarLeft />
          </Button>
        </div>
        {usedTags.length > 0 && (
          <Section className="w-full col mb-4">
            <h3 className="font-[700] text-[16px] text-white">Used tags</h3>
            <div className="row w-full gap-2 flex-wrap">
              {usedTags.map((tag) => {
                const active = usedTags.includes(tag)
                return (
                  <div
                    key={`used_tag-${tag}`}
                    className={clsx(
                      'row gap-2 px-2 py-1 rounded hover:bg-[#14B8A6] cursor-pointer text-white',
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
                  const filterStyles = filteredTags[category].filter(
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
              {filteredTags[category] &&
                filteredTags[category].map((tag) => {
                  const active = usedTags.includes(tag)
                  return (
                    <div
                      key={`${category}-${tag}`}
                      className={clsx(
                        'row gap-2 px-2 py-1 rounded hover:bg-[#14B8A6] cursor-pointer text-white',
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
