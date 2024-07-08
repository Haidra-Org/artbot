/* eslint-disable @next/next/no-img-element */
import NiceModal from '@ebay/nice-modal-react'
import {
  IconArrowBarLeft,
  IconDeviceFloppy,
  IconFilter,
  IconGrid3x3
} from '@tabler/icons-react'

import Button from '../../Button'
import { useEffect, useMemo, useRef, useState } from 'react'
import useCivitAi from '@/app/_hooks/useCivitai'
import { debounce } from '@/app/_utils/debounce'
import LoraFilter from './LoraFilter'
import LoraImage from './LoraImage'
import {
  Embedding,
  SavedEmbedding,
  SavedLora
} from '@/app/_data-models/Civitai'
import { MasonryLayout } from '../../Masonry'

export default function LoraSearch({
  civitAiType = 'LORA',
  onUseLoraClick = () => {},
  searchType = 'search'
}: {
  civitAiType?: 'LORA' | 'TextualInversion'
  onUseLoraClick?: (savedLora: SavedEmbedding | SavedLora) => void
  searchType?: 'search' | 'favorite' | 'recent'
}) {
  const {
    fetchCivitAiResults,
    pendingSearch,
    searchResults,
    setPendingSearch
  } = useCivitAi({
    searchType,
    type: civitAiType
  })

  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputVersionId, setInputVersionId] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [showFilter, setShowFilter] = useState(false)

  // Memoize the debounced function so it doesn't get recreated on every render
  const debouncedSearchRequest = useMemo(() => {
    return debounce(fetchCivitAiResults, 750)
  }, [fetchCivitAiResults])

  useEffect(() => {
    if (inputVersionId || !searchInput.trim()) return
    debouncedSearchRequest(searchInput)
  }, [debouncedSearchRequest, inputVersionId, searchInput])

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current!.focus()
      }, 400)
    }
  }, [])

  const transformedData = searchResults.map((embedding: Embedding) => {
    // TODO: Should probably find image with lowest NSFW rating.
    // Extracting the first model version and its first image
    const firstModelVersion = embedding.modelVersions[0]
    const firstImage = firstModelVersion.images[0]

    const photoData = {
      key: String(embedding.id), // Ensuring the key is a string
      name: embedding.name,
      baseModel: firstModelVersion.baseModel,
      nsfwLevel: firstImage.nsfwLevel,
      src: firstImage.url,
      width: firstImage.width,
      height: firstImage.height,
      details: embedding
    }

    return photoData
  })

  const subject = civitAiType === 'LORA' ? 'LoRA' : 'Embedding'

  let title = `${subject} Search`

  if (searchType === 'favorite') {
    title = `Favorite ${subject}s`
  } else if (searchType === 'recent') {
    title = `Recently used ${subject}s`
  }

  let placeholder = 'Enter LoRA or Lycoris name'

  if (inputVersionId) {
    placeholder = 'Enter CivitAI version ID'
  }

  if (civitAiType === 'TextualInversion') {
    placeholder = 'Enter textual inversion or embedding name'
  }

  return (
    <div className="col w-full h-full" ref={modalRef}>
      <h2 className="row font-bold">
        {title} <span className="text-xs font-normal">(via CivitAI)</span>
      </h2>
      <div className="row w-full">
        {searchType === 'search' && civitAiType === 'LORA' && (
          <Button
            outline={!inputVersionId}
            onClick={() => {
              setSearchInput('')
              setInputVersionId(!inputVersionId)
            }}
            title="Input by version ID"
          >
            <IconGrid3x3 />
          </Button>
        )}
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={placeholder}
          onChange={(e) => {
            if (e.target.value.trim()) {
              setPendingSearch(true)
            }

            setSearchInput(e.target.value)
          }}
          ref={inputRef}
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
        {inputVersionId && (
          <Button
            disabled={!searchInput.trim()}
            onClick={() => {
              const savedLora = new SavedLora({
                id: searchInput.trim(),
                civitAiType: 'LORA',
                versionId: searchInput.trim(),
                versionName: '',
                isArtbotManualEntry: true,
                name: searchInput.trim(),
                strength: 1,
                clip: 1
              })

              onUseLoraClick(savedLora as unknown as SavedLora)
              NiceModal.remove('modal')
            }}
            title="Use LoRA by Version ID"
          >
            <IconDeviceFloppy />
          </Button>
        )}
        {!inputVersionId && (
          <Button
            outline={!showFilter}
            onClick={() => {
              setShowFilter(!showFilter)
            }}
          >
            <IconFilter />
          </Button>
        )}
      </div>
      {showFilter && !inputVersionId && (
        <LoraFilter
          onSelectionChange={() => {
            if (!searchInput.trim()) return
            debouncedSearchRequest(searchInput)
          }}
        />
      )}
      {inputVersionId && (
        <div>Enter CivitAI version ID in order to directly use LoRA.</div>
      )}
      {!inputVersionId &&
        !pendingSearch &&
        searchInput.trim() &&
        searchResults.length === 0 && (
          <div className="w-full row justify-center items-center">
            No results found.
          </div>
        )}
      {!inputVersionId && pendingSearch && (
        <div className="w-full row justify-center items-center">
          Loading results...
        </div>
      )}
      <div>
        <MasonryLayout containerRef={modalRef}>
          {transformedData.map((image) => (
            <div
              key={`${image.key}`}
              style={{ width: '100%', marginBottom: '20px' }}
            >
              <LoraImage
                civitAiType={civitAiType}
                onUseLoraClick={onUseLoraClick}
                image={image}
              />
            </div>
          ))}
        </MasonryLayout>
      </div>
    </div>
  )
}
