import {
  getAllWords,
  getPromptHistoryCountFromDexie,
  getPromptHistoryFromDexie,
  getPromptsByWordsWithPagination
} from '@/app/_db/promptsHistory'
import { PromptsHistory } from '@/app/_types/ArtbotTypes'
import { useEffect, useState } from 'react'
import PromptHistoryCard from './PromptHistoryCard'
import ReactPaginate from 'react-paginate'
import Button from '../Button'
import {
  IconArrowBarLeft,
  IconBulb,
  IconHeart,
  IconHeartFilled
} from '@tabler/icons-react'

const LIMIT_PER_PAGE = 5

interface PromptLibraryProps {
  setPrompt?: (prompt: string) => void
  type?: 'prompt' | 'negative'
}
export default function PromptLibrary({
  type = 'prompt',
  setPrompt = () => {}
}: PromptLibraryProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [initLoad, setInitLoad] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [prompts, setPrompts] = useState<PromptsHistory[]>([])

  const getPrompts = async (
    {
      page,
      searchTerm,
      favorites
    }: {
      page: number
      searchTerm: string
      favorites?: boolean
    } = {
      page: 0,
      searchTerm: '',
      favorites: false
    }
  ) => {
    const offset = page * LIMIT_PER_PAGE

    let count
    let data

    if (searchTerm.trim().length > 2) {
      const array = getAllWords(searchTerm)
      count = await getPromptsByWordsWithPagination(
        array,
        offset,
        LIMIT_PER_PAGE,
        type,
        true
      )
      data = await getPromptsByWordsWithPagination(
        array,
        offset,
        LIMIT_PER_PAGE,
        type,
        false
      )
    } else {
      count = await getPromptHistoryCountFromDexie(type, favorites)
      data = await getPromptHistoryFromDexie({
        offset,
        limit: LIMIT_PER_PAGE,
        promptType: type,
        showFavorites: favorites
      })
    }

    setPrompts(data as PromptsHistory[])
    setTotalItems(count as number)
    setInitLoad(false)
  }

  useEffect(() => {
    getPrompts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const title = type === 'prompt' ? 'Prompt Libary' : 'Negative Prompt Libary'

  return (
    <div className="col w-full h-full">
      <h2 className="row font-bold">{title}</h2>
      <div className="col gap-4">
        <div className="row w-full">
          {type === 'negative' && (
            <Button
              outline={!showSuggestions}
              onClick={() => {
                setShowSuggestions(!showSuggestions)
              }}
              title="Suggested prompts"
            >
              <IconBulb />
            </Button>
          )}
          <input
            className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder={'Search your prompts'}
            onChange={(e) => {
              getPrompts({ page: 0, searchTerm: e.target.value })
              setSearchInput(e.target.value)
            }}
            value={searchInput}
          />
          <Button
            disabled={!searchInput.trim()}
            theme="danger"
            onClick={async () => {
              setCurrentPage(0)
              setSearchInput('')
              await getPrompts({ page: 0, searchTerm: '' })
            }}
          >
            <IconArrowBarLeft />
          </Button>
          <Button
            outline={!showFavorites}
            onClick={async () => {
              const favStatus = !showFavorites
              setShowSuggestions(false)
              setShowFavorites(favStatus)
              await getPrompts({
                page: 0,
                searchTerm: searchInput,
                favorites: favStatus
              })
            }}
          >
            {showFavorites ? <IconHeartFilled /> : <IconHeart />}
          </Button>
        </div>
        {!showSuggestions && (
          <div className="text-sm">
            Page {currentPage + 1} of{' '}
            {Math.ceil(totalItems / LIMIT_PER_PAGE) || 1} ({totalItems} prompts)
          </div>
        )}
        {!showSuggestions && !initLoad && totalItems === 0 && (
          <p>
            {showFavorites
              ? 'No favorited prompts found.'
              : 'No items found. Try creating an image, first!'}
          </p>
        )}
        {showSuggestions && <p>Negative prompt suggestions</p>}
        {showSuggestions && (
          <>
            <PromptHistoryCard
              // @ts-expect-error Only partial data needed for suggestion
              prompt={{
                artbot_id: '_suggestion',
                prompt: 'ugly, deformed, noisy, blurry, low contrast'
              }}
              setPrompt={setPrompt}
            />
            <PromptHistoryCard
              // @ts-expect-error Only partial data needed for suggestion
              prompt={{
                artbot_id: '_suggestion',
                prompt:
                  'lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, out of frame, deformed, blurry, username, watermark, signature'
              }}
              setPrompt={setPrompt}
            />
          </>
        )}
        {!showSuggestions &&
          prompts.map((prompt) => {
            return (
              <PromptHistoryCard
                key={prompt.artbot_id}
                prompt={prompt}
                setPrompt={setPrompt}
                onDelete={async () => {
                  await getPrompts({
                    page: currentPage,
                    searchTerm: searchInput,
                    favorites: showFavorites
                  })
                }}
              />
            )
          })}
      </div>
      {showSuggestions && (
        <div className="row justify-center my-2">
          <ReactPaginate
            breakLabel="..."
            nextLabel="⇢"
            onPageChange={async (val) => {
              setCurrentPage(val.selected)
              await getPrompts({ page: val.selected, searchTerm: searchInput })
            }}
            containerClassName="row gap-0"
            activeClassName="bg-[#969696]"
            activeLinkClassName="bg-[#969696] hover:bg-[#969696] cursor-default"
            breakLinkClassName="border px-2 py-1 bg-[#8ac5d1] hover:bg-[#8ac5d1]"
            pageLinkClassName="border px-4 py-2 bg-[#6AB7C6] hover:bg-[#8ac5d1]"
            previousLinkClassName="rounded-l-md border px-4 py-2 bg-[#6AB7C6] hover:bg-[#8ac5d1]"
            nextLinkClassName="rounded-r-md border px-4 py-2 bg-[#6AB7C6] hover:bg-[#8ac5d1]"
            disabledLinkClassName="bg-[#969696] hover:bg-[#969696] cursor-default"
            pageRangeDisplayed={5}
            pageCount={Math.ceil(totalItems / LIMIT_PER_PAGE)}
            previousLabel="⇠"
            renderOnZeroPageCount={null}
          />
        </div>
      )}
    </div>
  )
}
