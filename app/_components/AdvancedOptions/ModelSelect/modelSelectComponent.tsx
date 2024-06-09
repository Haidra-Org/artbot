'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import { AvailableImageModel } from '@/app/_types/HordeTypes'
import { IconAlertTriangle } from '@tabler/icons-react'
import Select, { SelectOption } from '../../Select'
import OptionLabel from '../OptionLabel'

export default function ModelSelectComponent({
  models,
  hasError = false
}: {
  models: AvailableImageModel[]
  hasError: boolean
}) {
  const { input, setInput } = useInput()

  const findModelCountByName = (name: string) => {
    // Find the model by name and return its count, or undefined if not found
    const model = models.find((model) => model.name === name)
    return model?.count ? ` (${model.count})` : ''
  }

  return (
    <OptionLabel
      title={
        <span className="row font-bold text-sm text-white gap-1">
          Image model
          {hasError && (
            <div style={{ color: 'orange' }}>
              <IconAlertTriangle />
            </div>
          )}
        </span>
      }
    >
      <div className="w-full">
        <Select
          onChange={(option: SelectOption) => {
            setInput({ models: [option.value as string] })
          }}
          options={models.map((model) => ({
            value: model.name,
            label: model.name + findModelCountByName(model.name)
          }))}
          value={{
            value: input.models[0],
            label: input.models[0]
              ? `${input.models[0]}${findModelCountByName(input.models[0])}`
              : input.models[0]
          }}
        />
      </div>
    </OptionLabel>
  )
}
