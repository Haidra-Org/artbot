/* eslint-disable @next/next/no-img-element */
import PhotoAlbum from 'react-photo-album'
import { Embedding } from '@/app/_types/CivitaiTypes'
import NiceModal from '@ebay/nice-modal-react'
import {
  IconArrowBarLeft,
  IconBox,
  IconDeviceFloppy,
  IconFilter,
  IconGrid3x3
} from '@tabler/icons-react'

import Button from '../../Button'
import { useEffect, useMemo, useState } from 'react'
import useCivitAi from '@/app/_hooks/useCivitai'
import { debounce } from '@/app/_utils/debounce'
import LoraFilter from './LoraFilter'
import LoraImage from './LoraImage'
import LoraDetails from './LoraDetails'
import { SavedLora } from '@/app/_types/ArtbotTypes'

export default function LoraSearch({
  onUseLoraClick = () => {},
  searchType = 'search'
}: {
  onUseLoraClick?: (savedLora: SavedLora) => void
  searchType?: 'search' | 'favorite' | 'recent'
}) {
  const {
    fetchCivitAiResults,
    pendingSearch,
    searchResults,
    setPendingSearch
  } = useCivitAi({
    searchType,
    type: 'LORA'
  })
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

  const transformedData = searchResults.map((embedding: Embedding) => {
    // TODO: Should probably find image with lowest NSFW rating.
    // Extracting the first model version and its first image
    const firstModelVersion = embedding.modelVersions[0]
    const firstImage = firstModelVersion.images[0]

    const photoData = {
      key: String(embedding.id), // Ensuring the key is a string
      name: embedding.name,
      baseModel: firstModelVersion.baseModel,
      src: firstImage.url,
      width: firstImage.width,
      height: firstImage.height,
      details: embedding
    }

    return photoData
  })

  let title = 'LoRA Search'

  if (searchType === 'favorite') {
    title = 'Favorite LoRAs'
  } else if (searchType === 'recent') {
    title = 'Recently used LoRAs'
  }

  return (
    <div className="col w-full h-full">
      <h2 className="row font-bold">
        {title} <span className="text-xs font-normal">(via CivitAI)</span>
      </h2>
      <div className="row w-full">
        {searchType === 'search' && (
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
          placeholder={
            inputVersionId
              ? 'Enter CivitAI version ID'
              : 'Search for LoRA or Lycoris'
          }
          onChange={(e) => {
            if (e.target.value.trim()) {
              setPendingSearch(true)
            }

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
        {inputVersionId && (
          <Button
            disabled={!searchInput.trim()}
            onClick={() => {
              const savedLora = {
                id: searchInput.trim(),
                versionId: searchInput.trim(),
                name: searchInput.trim(),
                strength: 1,
                clip: 1
              }

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
      {!inputVersionId && !pendingSearch && (
        <div>
          <PhotoAlbum
            layout="columns"
            spacing={8}
            photos={transformedData}
            renderPhoto={(renderPhotoProps) => {
              const { layoutOptions, photo, imageProps } =
                renderPhotoProps || {}
              const { alt } = imageProps || {}

              return (
                <div
                  key={photo.key}
                  style={{
                    display: 'flex',
                    cursor: 'pointer',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    marginBottom: layoutOptions.spacing
                  }}
                  onClick={() => {
                    NiceModal.show('embeddingDetails', {
                      children: (
                        <LoraDetails
                          details={photo.details}
                          onUseLoraClick={onUseLoraClick}
                        />
                      ),
                      id: 'LoraDetails'
                    })
                  }}
                >
                  <LoraImage
                    alt={alt}
                    height={renderPhotoProps.layout.height}
                    width={renderPhotoProps.layout.width}
                    imageProps={imageProps}
                  />
                  <div
                    style={{
                      alignItems: 'center',
                      backgroundColor: 'black',
                      bottom: '64px',
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'row',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      gap: '8px',
                      height: '24px',
                      padding: '4px',
                      left: 0,
                      position: 'absolute',
                      opacity: 0.9
                    }}
                  >
                    <IconBox stroke={1} />
                    {photo.baseModel}
                  </div>
                  <div
                    className="row items-center justify-center font-bold text-xs px-2 text-center"
                    style={{
                      backdropFilter: 'blur(10px)',
                      bottom: 0,
                      height: '64px',
                      left: 0,
                      position: 'absolute',
                      right: 0
                    }}
                  >
                    <div>{photo.name}</div>
                    {/* <div
                      className="z-1"
                      style={{
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'black',
                        opacity: 0.7,
                        bottom: 0,
                        height: '64px',
                        left: 0,
                        position: 'absolute',
                        right: 0
                      }}
                    ></div> */}
                  </div>
                </div>
              )
            }}
          />
        </div>
      )}
    </div>
  )
}
