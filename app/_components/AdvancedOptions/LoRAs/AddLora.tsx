'use client'

import { IconHeartSearch, IconHistory, IconPlus } from '@tabler/icons-react'
import Button from '../../Button'
import Section from '../../Section'
import NiceModal from '@ebay/nice-modal-react'
import LoraSearch from './LoraSearch'
import { useInput } from '@/app/_providers/PromptInputProvider'
import LoraSettingsCard from './LoraSettingsCard'
import { useCallback } from 'react'
import { SavedLora } from '@/app/_data-models/Civitai'

const MAX_LORAS = 5

export default function AddLora() {
  const { input, setInput } = useInput()

  const handleUseLoraClick = useCallback(
    (savedLora: SavedLora) => {
      if (input.loras.length >= MAX_LORAS) return

      const found =
        input.loras.filter(
          (lora) => String(lora.name) === String(savedLora.versionId)
        ) || ([] as unknown as SavedLora)
      if (found.length > 0) return

      const updateLoras = [...input.loras, savedLora]
      setInput({ loras: updateLoras })
    },
    [input, setInput]
  )

  return (
    <Section>
      <div className="row justify-between">
        <h2 className="row font-bold text-white">
          LoRAs{' '}
          <span className="text-xs font-normal">
            ({input.loras.length} / {MAX_LORAS})
          </span>
        </h2>
        <div className="row gap-1">
          <Button
            disabled={input.loras.length >= MAX_LORAS}
            onClick={() => {
              NiceModal.show('modal', {
                children: <LoraSearch onUseLoraClick={handleUseLoraClick} />,
                modalStyle: {
                  maxWidth: '1600px',
                  minHeight: `calc(100vh - 32px)`,
                  width: 'calc(100% - 32px)'
                }
              })
            }}
          >
            <IconPlus />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: (
                  <LoraSearch
                    onUseLoraClick={handleUseLoraClick}
                    searchType="favorite"
                  />
                ),
                modalStyle: {
                  maxWidth: '1600px',
                  minHeight: `calc(100vh - 32px)`,
                  width: '100%'
                }
              })
            }}
          >
            <IconHeartSearch />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: (
                  <LoraSearch
                    onUseLoraClick={handleUseLoraClick}
                    searchType="recent"
                  />
                ),
                modalStyle: {
                  maxWidth: '1600px',
                  minHeight: `calc(100vh - 32px)`,
                  width: '100%'
                }
              })
            }}
          >
            <IconHistory />
          </Button>
        </div>
      </div>
      {input.loras.length > 0 && (
        <div className="w-full col">
          {input.loras.map((lora) => (
            <div key={lora.versionId} className="w-full col">
              <LoraSettingsCard lora={lora} />
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
