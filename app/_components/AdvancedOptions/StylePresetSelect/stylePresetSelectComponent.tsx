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
  StylePresetConfigurations
} from '@/app/_types/HordeTypes'

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
                    setInput({
                      preset: [
                        { name: option, settings: { ...presets[option] } }
                      ]
                    })
                    NiceModal.remove('modal')
                  }}
                />
              ),
              modalClassName: 'w-full md:min-w-[640px] max-w-[768px]'
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

            setInput({
              preset: [{ name: randomPreset, settings: presets[randomPreset] }]
            })
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
