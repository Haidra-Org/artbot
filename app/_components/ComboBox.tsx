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

  value: string | number
}

export default function SelectCombo({
  disabled = false,
  onChange = () => {},
  options,
  value
}: {
  disabled?: boolean
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

  const handleSelectOption = (option: SelectOption) => {
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

  useClickAway(ref, () => {
    handleSelectOption(value)
    handleUnfocusInput()
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
              <ComboboxOptions
                static
                className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm bg-gray-50 border border-gray-300 text-gray-900 text-[16px] focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
              >
                {filteredOptions.map((option, idx) => {
                  return (
                    <ComboboxOption
                      key={`option-${option.value}-${idx}`}
                      value={option}
                      onClick={(e) => {
                        // Need prevent default here so that ComboBoxInput
                        // onClick event doesn't capture this click.
                        e.preventDefault()

                        handleSelectOption(option)
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
                  )
                })}
              </ComboboxOptions>
            )}
          </>
        )}
      </Combobox>
    </div>
  )
}
