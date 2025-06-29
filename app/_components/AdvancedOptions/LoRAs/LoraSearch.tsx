/* eslint-disable @next/next/no-img-element */
import NiceModal from '@ebay/nice-modal-react'
import {
  IconArrowBarLeft,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconFilter,
  IconGrid3x3
} from '@tabler/icons-react'

import Button from '../../Button'
import { useEffect, useRef, useState } from 'react'
import useCivitAi from '@/app/_hooks/useCivitai'
import LoraFilter from './LoraFilter'
import LoraImage from './LoraImage'
import {
  Embedding,
  SavedEmbedding,
  SavedLora
} from '@/app/_data-models/Civitai'
import { MasonryLayout } from '../../Masonry'
import clsx from 'clsx'

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
    currentPage,
    debouncedSearchRequest,
    pendingSearch,
    searchResults,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    setLocalFilterTermAndResetPage
  } = useCivitAi({
    searchType,
    type: civitAiType
  })

  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputVersionId, setInputVersionId] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [showFilter, setShowFilter] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setSearchInput(e.target.value)
    if (searchType === 'favorite' || searchType === 'recent') {
      setLocalFilterTermAndResetPage(value.trim())
    } else {
      // Always call debouncedSearchRequest, even with empty string to load defaults
      debouncedSearchRequest(value.trim())
    }
  }

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current!.focus()
      }, 400)
    }
  }, [])

  const transformedData = searchResults.map(
    (item: Embedding | SavedEmbedding | SavedLora) => {
      let photoData

      if ('modelVersions' in item) {
        // This is a CivitAI Embedding
        const embedding = item as Embedding
        const firstModelVersion = embedding.modelVersions[0] || {}
        const firstImage = firstModelVersion.images?.[0] || {}

        photoData = {
          key: String(embedding.id),
          name: embedding.name,
          baseModel: firstModelVersion.baseModel,
          nsfwLevel: firstImage.nsfwLevel,
          src: firstImage.url,
          width: firstImage.width,
          height: firstImage.height,
          details: embedding
        }
      } else if ('model' in item) {
        // @ts-expect-error TODO: Fix this
        const embedding = item.model as Embedding
        const firstModelVersion = embedding.modelVersions[0] || {}
        const firstImage = firstModelVersion.images?.[0] || {}

        photoData = {
          key: String(embedding.id),
          name: embedding.name,
          baseModel: firstModelVersion.baseModel,
          nsfwLevel: firstImage.nsfwLevel,
          src: firstImage.url,
          width: firstImage.width,
          height: firstImage.height,
          details: embedding
        }
      }

      return photoData
    }
  )

  const filteredData = transformedData.filter(
    (item): item is NonNullable<typeof item> => item !== undefined
  )

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
          onChange={handleInputChange}
          ref={inputRef}
          value={searchInput}
        />
        <Button
          theme="danger"
          onClick={() => {
            setSearchInput('')
            // Reset search to load default results
            debouncedSearchRequest('')
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
            if (searchInput.trim()) {
              debouncedSearchRequest(searchInput.trim())
            }
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
          {filteredData.map((image) => (
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
      {(hasPreviousPage || hasNextPage) && (
        <div className="w-full row justify-center gap-2">
          <div
            className={clsx(
              'cursor-pointer',
              hasPreviousPage ? 'primary-color' : 'text-gray-400'
            )}
            onClick={() => {
              if (hasPreviousPage) {
                goToPreviousPage()
              }
            }}
          >
            <IconChevronLeft />
          </div>
          <div>{currentPage}</div>
          <div
            className={clsx(
              'cursor-pointer',
              hasNextPage ? 'primary-color' : 'text-gray-400'
            )}
            onClick={() => {
              if (hasNextPage) {
                goToNextPage()
              }
            }}
          >
            <IconChevronRight />
          </div>
        </div>
      )}
    </div>
  )
}
