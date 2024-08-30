'use client'

import NiceModal from '@ebay/nice-modal-react'
import OptionLabel from '../OptionLabel'
import { useInput } from '@/app/_providers/PromptInputProvider'
import Button from '../../Button'
import { IconListDetails, IconWand } from '@tabler/icons-react'
import ModelModalWrapper from './modalWrapper'
import { useStore } from 'statery'
import { ModelStore } from '@/app/_stores/ModelStore'
import SelectCombo from '../../ComboBox'
import PromptInput from '@/app/_data-models/PromptInput'

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
          // @ts-expect-error - value will always be string here
          onChange={(option: { value: string }) => {
            if (!option || !option.value) return

            const modelInfo = {
              baseline: modelDetails[option.value as string]?.baseline ?? '',
              version: modelDetails[option.value as string]?.version ?? ''
            }

            // PonyXL models require a CLIP setting of at least 2
            const isPonyModel = option.value.toLowerCase().indexOf('pony') >= 0

            if (PromptInput.isDefaultPromptInput(input) && option.value !== 'AlbedoBase XL (SDXL)') {
              setInput(PromptInput.setNonTurboDefaultPromptInput({
                ...input, models: [option.value as string],
                clipskip: isPonyModel && input.clipskip < 2 ? 2 : input.clipskip
              }))
            } else if (input.models[0] !== 'AlbedoBase XL (SDXL)' && option.value === 'AlbedoBase XL (SDXL)') {
              setInput(PromptInput.setTurboDefaultPromptInput({ ...input, models: [option.value as string] }))
            } else {
              setInput({
                models: [option.value as string],
                modelDetails: modelInfo
              })
            }

            if (option.value.toLowerCase().indexOf('pony') >= 0 && input.clipskip < 2) {
              setInput({
                models: [option.value as string],
                modelDetails: modelInfo,
                clipskip: 2
              })
            }
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
