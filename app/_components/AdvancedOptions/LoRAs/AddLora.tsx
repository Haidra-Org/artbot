'use client'

import { IconHeartSearch, IconHistory, IconPlus } from '@tabler/icons-react'
import Button from '../../Button'
import Section from '../../Section'
import NiceModal from '@ebay/nice-modal-react'
import LoraSearch from './LoraSearch'
import { useInput } from '@/app/_providers/PromptInputProvider'
import { SavedLora } from '@/app/_types/ArtbotTypes'
import LoraSettingsCard from './LoraSettingsCard'

export default function AddLora() {
  const { input, setInput } = useInput()

  const handleUseLoraClick = (savedLora: SavedLora) => {
    const found =
      input.loras.filter(
        (lora) => String(lora.name) === String(savedLora.versionId)
      ) || ([] as unknown as SavedLora)
    if (found.length > 0) return

    const updateLoras = [...input.loras, savedLora]
    setInput({ loras: updateLoras })
  }

  return (
    <Section>
      <div className="row justify-between">
        <h2 className="row font-bold">
          LoRAs{' '}
          <span className="text-xs font-normal">
            ({input.loras.length} / 5)
          </span>
        </h2>
        <div className="row gap-1">
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <LoraSearch onUseLoraClick={handleUseLoraClick} />,
                modalStyle: {
                  maxWidth: '1600px',
                  minHeight: `calc(100vh - 32px)`,
                  width: '100%'
                }
              })
            }}
          >
            <IconPlus />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <div>Favorite LoRAs - hello!</div>
              })
            }}
          >
            <IconHeartSearch />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: <div>Recently used LoRAs- hello!</div>
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
