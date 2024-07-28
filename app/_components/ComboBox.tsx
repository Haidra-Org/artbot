import clsx from 'clsx'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from '@headlessui/react'
import { IconChevronDown } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { useClickAway } from 'react-use'
import Portal from './Portal'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export interface SelectOption {
  /**
   * This is the "nice" display label for the option
   */
  label: string

  /**
   * This is used to filter options. e.g., if you want to filer by a name and id, you can pass both values in here:
   * {label: 'Nice Name', filterLabel: 'Nice Name abc123xyz}
   */
  filterLabel?: string

  /**
   * An optional component to format how the dropdown options are presented.
   */
  component?: React.ReactNode

  value: string | number | boolean
}

export default function SelectCombo({
  onChange = () => {},
  options,
  value
}: {
  onChange: (option: SelectOption) => void
  options: SelectOption[]
  value: SelectOption
}) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [optionsPanelOpen, setOptionsPanelOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(value.label)
  const [searchQuery, setSearchQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    setSearchInput(value.label)
  }, [value.label])

  const handleInputFocus = () => {
    setOptionsPanelOpen(true)
    setSearchQuery('')
  }

  const handleOnChangeSelection = (option: SelectOption) => {
    onChange(option)
  }

  const handleSelectOption = (
    option: SelectOption,
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    handleUnfocusInput()
    setOptionsPanelOpen(false)
    setSearchInput(option.label)
    onChange(option)
  }

  const handleUnfocusInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.blur()
    }
  }

  useClickAway(ref, (event) => {
    if (!(event.target as Element).closest('.combobox-options')) {
      handleSelectOption(value)
      handleUnfocusInput()
    }
  })

  const filteredOptions = options.filter((option) => {
    if (!option.label) return false

    if (option.filterLabel) {
      return option.filterLabel
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    }

    return option.label.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="relative w-full" ref={ref}>
      <Combobox
        value={value}
        onChange={handleOnChangeSelection}
        onClose={() => {}}
      >
        {({ activeOption }) => (
          <>
            <div className="justify-between relative cursor-pointer bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <ComboboxInput
                ref={searchInputRef}
                className={clsx(
                  'w-full !bg-input !placeholder-gray-800 dark:!placeholder-white dark:text-white text-[16px]'
                )}
                displayValue={(option: SelectOption) => option.label}
                onChange={(e) => {
                  if (optionsPanelOpen) {
                    setSearchQuery(e.target.value)
                  } else {
                    setSearchInput(e.target.value)
                  }
                }}
                onClick={() => {
                  setOptionsPanelOpen(true)
                }}
                onFocus={handleInputFocus}
                placeholder={activeOption?.label ?? ''}
                value={optionsPanelOpen ? searchQuery : searchInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activeOption) {
                    setSearchQuery(activeOption.label)
                    handleSelectOption(activeOption)

                    if (searchInputRef.current) {
                      searchInputRef.current.blur()
                    }

                    setOptionsPanelOpen(false)
                  } else if (e.key === 'Enter' && !activeOption) {
                    e.preventDefault()
                  }
                }}
                style={{
                  textOverflow: 'ellipsis',
                  width: 'calc(100% - 24px)'
                }}
              />
              <ComboboxButton
                onClick={() => {
                  setOptionsPanelOpen(true)
                }}
              >
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <IconChevronDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </ComboboxButton>
            </div>
            {optionsPanelOpen && filteredOptions.length > 0 && (
              <Portal>
                <div
                  className="absolute !z-[1000] w-full"
                  style={{
                    top: `${(searchInputRef.current as HTMLInputElement).getBoundingClientRect().bottom + window.scrollY + 8}px`,
                    left: `${(searchInputRef.current as HTMLInputElement).getBoundingClientRect().left + window.scrollX - 8}px`,
                    width:
                      (searchInputRef.current as HTMLInputElement).offsetWidth +
                      40
                  }}
                >
                  <ComboboxOptions
                    static
                    className="combobox-options absolute !z-[1000] mt-1 max-h-56 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm bg-gray-50 border border-gray-300 text-gray-900 text-[16px] focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
                  >
                    {filteredOptions.map((option, idx) => (
                      <ComboboxOption
                        key={`option-${option.value}-${idx}`}
                        value={option}
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleSelectOption(option, e)
                        }}
                        className={({ focus }) =>
                          classNames(
                            focus ? 'bg-indigo-600 ' : '',
                            'text-black dark:text-white relative cursor-default rounded-md select-none py-2 pl-1 pr-9 hover:bg-indigo-600 hover:text-white'
                          )
                        }
                      >
                        {option.component ? option.component : option.label}
                      </ComboboxOption>
                    ))}
                  </ComboboxOptions>
                </div>
              </Portal>
            )}
          </>
        )}
      </Combobox>
    </div>
  )
}
