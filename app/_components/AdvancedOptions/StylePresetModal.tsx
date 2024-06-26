/* eslint-disable @next/next/no-img-element */
import {
  IconArrowBarLeft,
  IconCheck,
  IconPhotoCog,
  IconWand
} from '@tabler/icons-react'
import React, { useState } from 'react'
import Button from '../Button'
import NiceModal from '@ebay/nice-modal-react'
import {
  CategoryPreset,
  StylePresetConfigurations,
  StylePreviewConfigurations
} from '@/app/_types/HordeTypes'
import useIntersectionObserver from '@/app/_hooks/useIntersectionObserver'
import DropdownMenu from '../DropdownMenu'
import { MenuItem } from '@szhsin/react-menu'

// Component to manage individual image loading and error handling
const ImageWithFallback = ({
  src,
  alt,
  fallbackColor,
  style
}: {
  src: string
  alt: string
  fallbackColor: string
  style?: React.CSSProperties
}) => {
  const { ref, isIntersecting, stopObserving } =
    useIntersectionObserver<HTMLDivElement>({
      rootMargin: '0px 0px 500px 0px', // Load when 500px below the viewport
      threshold: 0.5 // Adjust threshold as needed
    })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div
      ref={ref}
      style={{
        width: '200px',
        height: '200px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: imageError ? fallbackColor : 'transparent',
        borderRadius: '4px',
        ...style
      }}
    >
      {!isIntersecting && !imageLoaded && !imageError && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: fallbackColor // Show fallback color while loading
          }}
        ></div>
      )}
      {(isIntersecting || imageLoaded) && (
        <img
          src={src}
          alt={alt}
          onLoad={() => {
            setImageLoaded(true)
            stopObserving()
          }}
          onError={() => {
            setImageError(true)
            stopObserving()
          }}
          style={{
            display: imageLoaded ? 'block' : 'none', // Hide image until loaded
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
    </div>
  )
}

const StylePresetModal = ({
  categories,
  previews,
  handleOnClick = () => {}
}: {
  categories: CategoryPreset
  presets: StylePresetConfigurations
  previews: StylePreviewConfigurations
  handleOnClick?: (preset: string) => void
}) => {
  const [searchInput, setSearchInput] = useState('')
  const [subject, setSubject] = useState('person')

  // Filter function to filter the categories based on the search input
  const filterCategories = (
    categories: CategoryPreset, // Correct type for categories
    searchInput: string
  ): CategoryPreset => {
    if (!searchInput) return categories // If no search input, return original categories

    const lowerCaseSearchInput = searchInput.toLowerCase()

    // Use reduce to filter the categories
    return Object.keys(categories).reduce<CategoryPreset>(
      (filtered, categoryKey) => {
        // Filter each category's array for matching strings
        const matchedItems = categories[categoryKey].filter((item) =>
          item.toLowerCase().includes(lowerCaseSearchInput)
        )

        // If the category has any matched items, add it to the filtered result
        if (matchedItems.length > 0) {
          filtered[categoryKey] = matchedItems
        }

        return filtered
      },
      {} as CategoryPreset
    ) // Initialize reduce with an empty CategoryPreset object
  }

  // Get the filtered categories based on the search input
  const filteredCategories = filterCategories(categories, searchInput)

  return (
    <div className="col w-full h-full">
      <h2 className="row font-bold">Style Presets</h2>
      <div className="row w-full mb-2">
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Filter presets"
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
        <DropdownMenu
          menuButton={
            <Button onClick={() => {}} title="View other preset example images">
              <IconPhotoCog />
            </Button>
          }
          direction="left"
        >
          <MenuItem
            onClick={() => {
              setSubject('person')
            }}
          >
            <div className="w-[20px] pr-1">
              {subject === 'person' && <IconCheck size={12} />}
            </div>
            Person
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSubject('place')
            }}
          >
            <div className="w-[20px] pr-1">
              {subject === 'place' && <IconCheck size={12} />}
            </div>
            Place
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSubject('thing')
            }}
          >
            <div className="w-[20px] pr-1">
              {subject === 'thing' && <IconCheck size={12} />}
            </div>
            Thing
          </MenuItem>
        </DropdownMenu>
      </div>
      {Object.keys(filteredCategories).map((category: string) => {
        if (
          !filteredCategories[category] ||
          filteredCategories[category].length === 0
        )
          return null
        return (
          <div key={category} className="w-full col mb-6">
            <h3 className="font-[700] text-[18px] row gap-2">
              {category}
              <button
                onClick={() => {
                  const filterStyles = filteredCategories[category]
                  const randomStyle =
                    filterStyles[
                      Math.floor(Math.random() * filterStyles.length)
                    ]

                  if (!randomStyle) {
                    return
                  }

                  handleOnClick(randomStyle)
                  NiceModal.remove('modal')
                }}
                title="Select random style"
              >
                <IconWand className="primary-color" />
              </button>
            </h3>
            <div className="row w-full gap-2 flex-wrap">
              <div className="row w-full gap-2 flex-wrap">
                {filteredCategories[category].map((preset) => {
                  if (!preset) return null
                  return (
                    <div
                      key={`${category}-${preset}`}
                      style={{
                        cursor: 'pointer',
                        width: '200px',
                        height: 'auto',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                      onClick={() => {
                        handleOnClick(preset)
                      }}
                    >
                      <ImageWithFallback
                        src={
                          previews[preset] && preset
                            ? // @ts-expect-error TODO: Add type
                              previews[preset][subject]
                            : ''
                        }
                        alt={preset}
                        fallbackColor="gray"
                      />
                      <div
                        style={{
                          width: '200px',
                          padding: '4px',
                          textAlign: 'center',
                          wordWrap: 'break-word',
                          whiteSpace: 'normal',
                          fontSize: '12px'
                        }}
                      >
                        {preset}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StylePresetModal
