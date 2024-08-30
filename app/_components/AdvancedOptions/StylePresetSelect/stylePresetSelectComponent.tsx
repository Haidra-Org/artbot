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
  StylePresetConfigurations,
  StylePreviewConfigurations
} from '@/app/_types/HordeTypes'
import { useCallback } from 'react'
import PromptInput, { DEFAULT_TURBO_LORA } from '@/app/_data-models/PromptInput'
import { SavedLora } from '@/app/_data-models/Civitai'
import { useStore } from 'statery'
import { ModelStore } from '@/app/_stores/ModelStore'

export default function StylePresetSelectComponent({
  categories,
  presets,
  previews,
  hasError = false
}: {
  categories: CategoryPreset
  presets: StylePresetConfigurations
  previews: StylePreviewConfigurations
  hasError: boolean
}) {
  const { input, setInput } = useInput()
  const { modelDetails } = useStore(ModelStore)

  const handleSelectPreset = useCallback(
    (option: string, presetSettings: StylePresetConfig) => {
      const updateInput: Partial<PromptInput> = {}

      Object.keys(presetSettings).forEach((key) => {
        if (key === 'prompt') return

        if (key === 'model') {
          updateInput.models = [presetSettings.model]
          updateInput.modelDetails = {
            baseline: modelDetails[presetSettings.model].baseline,
            version: modelDetails[presetSettings.model].version
          }
          return
        }

        if (key === 'height' || key === 'width') {
          updateInput.imageOrientation = 'custom'
        }

        if (key === 'loras' && typeof presetSettings.loras !== 'undefined') {
          updateInput.loras = []
          presetSettings.loras.forEach((lora) => {
            let updateLora: SavedLora
            if (lora.name == '247778') {
              updateLora = DEFAULT_TURBO_LORA
            } else {
              updateLora = new SavedLora({
                id: lora.name,
                versionId: lora.is_version ? Number(lora.name) : false,
                versionName: lora.name,
                isArtbotManualEntry: true,
                name: lora.name,
                strength: lora.model || 1,
                clip: lora.clip_skip || 1
              })
            }

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
    [modelDetails, setInput]
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
                  previews={previews}
                  handleOnClick={(option: string) => {
                    handleSelectPreset(option, presets[option])
                    NiceModal.remove('modal')
                  }}
                />
              ),
              modalClassName: 'w-full md:min-w-[640px] max-w-[648px]'
            })
          }}
          onChange={() => { }}
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
