import { useState } from 'react'
import Section from '../../Section'
import { AppSettings } from '@/app/_data-models/AppSettings'
import { CivitAiBaseModels } from '@/app/_types/ArtbotTypes'

interface CheckboxOption {
  label: string
  value: CivitAiBaseModels
}

interface CheckboxGroupProps {
  onSelectionChange?: (selectedOptions?: string[]) => void
}

export default function LoraFilter({
  onSelectionChange = () => {}
}: CheckboxGroupProps) {
  const options: CheckboxOption[] = [
    { label: 'SD 1.x', value: 'SD 1.x' },
    { label: 'SD 2.x', value: 'SD 2.x' },
    { label: 'SDXL', value: 'SDXL' },
    { label: 'Pony', value: 'Pony' },
    { label: 'Show NSFW?', value: 'NSFW' }
  ]

  const [selectedOptions, setSelectedOptions] = useState<CivitAiBaseModels[]>(
    AppSettings.get('civitAiBaseModelFilter')
  )

  // Handler for checkbox changes
  const handleCheckboxChange = (option: CivitAiBaseModels) => {
    setSelectedOptions((prevSelected) => {
      const updatedOptions = prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option]

      AppSettings.set('civitAiBaseModelFilter', updatedOptions)
      onSelectionChange(updatedOptions)

      return updatedOptions
    })
  }

  return (
    <Section className="row items-center justify-center px-4">
      <div className="row w-full justify-between items-center px-4">
        {options.map((option) => (
          <div key={option.value} className="row gap-1">
            <input
              id={`checkbox-${option.value}`}
              type="checkbox"
              checked={selectedOptions.includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor={`checkbox-${option.value}`}
              className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </Section>
  )
}
