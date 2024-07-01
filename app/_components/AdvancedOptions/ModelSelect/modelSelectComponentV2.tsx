'use client'

import NiceModal from '@ebay/nice-modal-react'
import Select from '../../Select'
import OptionLabel from '../OptionLabel'
import { useInput } from '@/app/_providers/PromptInputProvider'
import Button from '../../Button'
import { IconWand } from '@tabler/icons-react'
import ModelModalWrapper from './modalWrapper'
import { useStore } from 'statery'
import { ModelStore } from '@/app/_stores/ModelStore'

export default function ModelSelect() {
  const { availableModels } = useStore(ModelStore)
  const { input, setInput } = useInput()

  const options = [
    {
      label: input.models[0],
      value: input.models[0]
    }
  ]

  return (
    <OptionLabel
      title={
        <span className="row font-bold text-sm text-white gap-1">
          Image model
        </span>
      }
    >
      <div className="w-full row">
        <Select
          hideDropdown
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
          onChange={() => {}}
          options={options}
          value={options[0]}
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
      </div>
    </OptionLabel>
  )
}
