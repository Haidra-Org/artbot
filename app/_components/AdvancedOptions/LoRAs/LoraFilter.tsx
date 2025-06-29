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
    { label: 'Flux.1', value: 'Flux' },
    { label: 'NoobAI', value: 'NoobAI' },
    { label: 'Illustrious', value: 'Illustrious' },
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
    <Section className="flex items-center justify-center px-4">
      <div className="flex flex-wrap justify-center items-center gap-4 w-full max-w-4xl">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-1 whitespace-nowrap">
            <input
              id={`checkbox-${option.value}`}
              type="checkbox"
              checked={selectedOptions.includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor={`checkbox-${option.value}`}
              className="text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </Section>
  )
}
