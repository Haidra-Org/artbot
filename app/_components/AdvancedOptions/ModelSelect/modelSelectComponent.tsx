'use client'

import NiceModal from '@ebay/nice-modal-react'
import OptionLabel from '../OptionLabel'
import { useInput } from '@/app/_providers/PromptInputProvider'
import Button from '../../Button'
import { IconListDetails, IconWand } from '@tabler/icons-react'
import ModelModalWrapper from './modalWrapper'
import { useStore } from 'statery'
import { ModelStore } from '@/app/_stores/ModelStore'
import SelectCombo, { SelectOption } from '../../ComboBox'

export default function ModelSelect() {
  const { availableModels, modelDetails } = useStore(ModelStore)
  const { input, setInput } = useInput()

  const findModelCountByName = (name: string) => {
    // Find the model by name and return its count, or undefined if not found
    const model = availableModels.find((model) => model.name === name)
    return model?.count ? ` (${model.count})` : ''
  }

  return (
    <OptionLabel
      title={
        <span className="row font-bold text-sm text-white gap-1">
          Image model
        </span>
      }
    >
      <div className="w-full row">
        <SelectCombo
          onChange={(option: SelectOption) => {
            if (!option || !option.value) return

            const modelInfo = {
              baseline: modelDetails[option.value as string]?.baseline ?? '',
              version: modelDetails[option.value as string]?.version ?? ''
            }

            setInput({
              models: [option.value as string],
              modelDetails: modelInfo
            })
          }}
          options={availableModels.map((model) => ({
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
        <Button
          onClick={() => {
            // Choose random element from: availableModels array

            const randomModel =
              availableModels[
                Math.floor(Math.random() * availableModels.length)
              ]

            setInput({ models: [randomModel.name] })
          }}
        >
          <IconWand />
        </Button>
        <Button
          onClick={() => {
            NiceModal.show('modal', {
              children: (
                <ModelModalWrapper
                  handleSelectModel={(model: string) => {
                    if (model) {
                      setInput({ models: [model] })
                      NiceModal.remove('modal')
                    }
                  }}
                />
              ),
              modalClassName: 'w-full md:min-w-[640px] max-w-[648px]'
            })
          }}
        >
          <IconListDetails />
        </Button>
      </div>
    </OptionLabel>
  )
}
