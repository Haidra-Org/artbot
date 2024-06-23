'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import OptionLabel from '../OptionLabel'
import { IconAlertTriangle, IconWand, IconX } from '@tabler/icons-react'
import Select from '../../Select'
import NiceModal from '@ebay/nice-modal-react'
import StylePresetModal from '../StylePresetModal'
import Button from '../../Button'
import {
  CategoryPreset,
  StylePresetConfig,
  StylePresetConfigurations
} from '@/app/_types/HordeTypes'
import { useCallback } from 'react'
import PromptInput from '@/app/_data-models/PromptInput'
import { SavedLora } from '@/app/_data-models/Civitai'

export default function StylePresetSelectComponent({
  categories,
  presets,
  hasError = false
}: {
  categories: CategoryPreset
  presets: StylePresetConfigurations
  hasError: boolean
}) {
  const { input, setInput } = useInput()

  const handleSelectPreset = useCallback(
    (option: string, presetSettings: StylePresetConfig) => {
      const updateInput: Partial<PromptInput> = {}

      Object.keys(presetSettings).forEach((key) => {
        if (key === 'prompt') return

        if (key === 'model') {
          updateInput.models = [presetSettings.model]
          return
        }

        if (key === 'height' || key === 'width') {
          updateInput.imageOrientation = 'custom'
        }

        if (key === 'loras' && typeof presetSettings.loras !== 'undefined') {
          updateInput.loras = []

          presetSettings.loras.forEach((lora) => {
            const updateLora = new SavedLora({
              id: lora.name,
              versionId: lora.is_version ? Number(lora.name) : false,
              isArtbotManualEntry: true,
              name: lora.name,
              strength: lora.model || 1,
              clip: lora.clip || 1
            })

            // @ts-expect-error updateInput.loras is defined right above this.
            updateInput.loras.push({ ...updateLora })
          })

          return
        }

        if (key === 'enhance') return

        // TODO: Better Handle Loras and tis?

        // @ts-expect-error All fields should be handled properly as of this point.
        updateInput[key as keyof PromptInput] = presetSettings[key]
      })

      setInput({
        ...updateInput,
        preset: [{ name: option, settings: { ...presetSettings } }]
      })
    },
    [setInput]
  )

  let options = [
    {
      label: 'None',
      value: 'none'
    }
  ]

  if (input.preset.length > 0) {
    options = [
      {
        label: input.preset[0].name,
        value: input.preset[0].name
      }
    ]
  }

  return (
    <OptionLabel
      anchor="style-preset"
      title={
        <span className="row font-bold text-sm text-white gap-1">
          Style preset
          {hasError && (
            <div style={{ color: 'orange' }}>
              <IconAlertTriangle />
            </div>
          )}
        </span>
      }
    >
      <div className="w-full row">
        <Select
          hideDropdown
          onClick={() => {
            NiceModal.show('modal', {
              children: (
                <StylePresetModal
                  categories={categories}
                  presets={presets}
                  handleOnClick={(option: string) => {
                    handleSelectPreset(option, presets[option])
                    NiceModal.remove('modal')
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
            const presetKeys = Object.keys(presets)
            const randomPreset =
              presetKeys[Math.floor(Math.random() * presetKeys.length)]

            handleSelectPreset(randomPreset, presets[randomPreset])
          }}
        >
          <IconWand />
        </Button>
        <Button
          theme="danger"
          onClick={() => {
            setInput({ preset: [] })
          }}
        >
          <IconX />
        </Button>
      </div>
    </OptionLabel>
  )
}