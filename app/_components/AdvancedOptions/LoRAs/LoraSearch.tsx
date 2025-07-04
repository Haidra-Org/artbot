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
import Spinner from '../../Spinner'

export default function LoraSearch({
  civitAiType = 'LORA',
  onUseLoraClick = () => {},
  searchType = 'search'
}: {
  civitAiType?: 'LORA' | 'TextualInversion'
  onUseLoraClick?: (savedLora: SavedEmbedding | SavedLora) => void
  searchType?: 'search' | 'favorite' | 'recent'
}) {
  console.log('[LoraSearch] Component rendered with:', { civitAiType, searchType })
  
  useEffect(() => {
    console.log('[LoraSearch] Component mounted')
    return () => {
      console.log('[LoraSearch] Component unmounting')
    }
  }, [])
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
  
  console.log('[LoraSearch] Hook returned:', {
    currentPage,
    pendingSearch,
    searchResultsCount: searchResults.length,
    hasNextPage,
    hasPreviousPage
  })

  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputVersionId, setInputVersionId] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [showFilter, setShowFilter] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    console.log('[LoraSearch] handleInputChange:', { value, searchType })
    setSearchInput(e.target.value)
    if (searchType === 'favorite' || searchType === 'recent') {
      setLocalFilterTermAndResetPage(value.trim())
    } else {
      // Always call debouncedSearchRequest, even with empty string to load defaults
      console.log('[LoraSearch] Calling debouncedSearchRequest with:', value.trim())
      debouncedSearchRequest(value.trim())
    }
  }

  useEffect(() => {
    console.log('[LoraSearch] Focus effect running')
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current!.focus()
      }, 400)
    }
  }, [])

  // Note: Initial load is handled by useCivitai hook
  // We don't need to trigger it here to avoid race conditions

  console.log('[LoraSearch] Transforming data, searchResults:', searchResults.length)
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
            // Trigger search with current input (even if empty) to apply new filters
            debouncedSearchRequest(searchInput.trim())
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
      <div className="relative min-h-[200px]">
        {pendingSearch && !inputVersionId && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-10 flex items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Spinner size={60} />
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading results...
              </div>
            </div>
          </div>
        )}
        <div className={clsx(pendingSearch && 'opacity-50')}>
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
      </div>
      {(hasPreviousPage || hasNextPage) && (
        <div className="w-full row justify-center gap-2 items-center">
          <div
            className={clsx(
              'cursor-pointer transition-opacity',
              hasPreviousPage && !pendingSearch ? 'primary-color' : 'text-gray-400',
              pendingSearch && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => {
              if (hasPreviousPage && !pendingSearch) {
                goToPreviousPage()
              }
            }}
          >
            <IconChevronLeft />
          </div>
          <div className="flex items-center gap-2">
            <span>{currentPage}</span>
            {pendingSearch && <Spinner size={16} />}
          </div>
          <div
            className={clsx(
              'cursor-pointer transition-opacity',
              hasNextPage && !pendingSearch ? 'primary-color' : 'text-gray-400',
              pendingSearch && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => {
              if (hasNextPage && !pendingSearch) {
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
