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
import { CategoryPreset } from '@/app/_types/HordeTypes'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div
      style={{
        width: '200px',
        height: '200px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: imageError ? fallbackColor : 'transparent',
        ...style
      }}
    >
      {!imageLoaded && !imageError && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: fallbackColor // Show fallback color while loading
          }}
        ></div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        style={{
          display: imageLoaded ? 'block' : 'none', // Hide image until loaded
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  )
}

const FilterableCategories = ({
  categories,
  handleOnClick = () => {}
}: {
  categories: CategoryPreset
  presets: unknown
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
        <Popover className="relative">
          <PopoverButton>
            <Button onClick={() => {}} title="View other preset example images">
              <IconPhotoCog />
            </Button>
          </PopoverButton>
          <PopoverPanel
            anchor="bottom"
            className="col bg-white dark:bg-black p-2 rounded-md w-[180px] mt-2"
            transition
            style={{
              border: '1px solid white'
            }}
          >
            <div className="text-sm font-bold">View examples:</div>
            <div
              onClick={() => setSubject('person')}
              className="row w-full  cursor-pointer"
            >
              <div className="w-[20px] pr-1">
                {subject === 'person' && <IconCheck size={12} />}
              </div>
              Person
            </div>
            <div
              onClick={() => setSubject('place')}
              className="row w-full  cursor-pointer"
            >
              <div className="w-[20px] pr-1">
                {subject === 'place' && <IconCheck size={12} />}
              </div>
              Place
            </div>
            <div
              onClick={() => setSubject('thing')}
              className="row w-full cursor-pointer"
            >
              <div className="w-[20px] pr-1">
                {subject === 'thing' && <IconCheck size={12} />}
              </div>
              Thing
            </div>
          </PopoverPanel>
        </Popover>
      </div>
      {Object.keys(filteredCategories).map((category: string) => (
        <div key={category} className="w-full col mb-6">
          <h3 className="font-[700] text-[18px] row gap-2">
            {category}
            <button
              onClick={() => {
                const filterStyles = filteredCategories[category]
                const randomStyle =
                  filterStyles[Math.floor(Math.random() * filterStyles.length)]

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
                const formatPreset = preset.replace(' ', '_')
                return (
                  <div
                    key={`${category}-${preset}`}
                    style={{
                      cursor: 'pointer',
                      width: '200px',
                      height: 'auto',
                      border: '1px solid white',
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
                      src={`https://raw.githubusercontent.com/amiantos/AI-Horde-Styles-Previews/main/images/${formatPreset}_${subject}.webp`}
                      alt={preset}
                      fallbackColor="gray"
                    />
                    <div
                      style={{
                        width: '200px',
                        padding: '8px',
                        textAlign: 'center',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal'
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
      ))}
    </div>
  )
}

export default FilterableCategories
