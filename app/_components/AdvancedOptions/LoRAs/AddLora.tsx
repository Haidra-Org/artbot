'use client'

import { IconHeartSearch, IconHistory, IconPlus } from '@tabler/icons-react'
import Button from '../../Button'
import Section from '../../Section'
import NiceModal from '@ebay/nice-modal-react'
import LoraSearch from './LoraSearch'
import { useInput } from '@/app/_providers/PromptInputProvider'
import LoraSettingsCard from './LoraSettingsCard'
import { Suspense, useCallback } from 'react'
import { SavedEmbedding, SavedLora } from '@/app/_data-models/Civitai'
import { AppConstants } from '@/app/_data-models/AppConstants'
import { toastController } from '@/app/_controllers/toastController'

export default function AddLora() {
  const { input, setInput } = useInput()

  // Define a type guard to check if the object is of type SavedLora
  const isSavedLora = (obj: SavedEmbedding | SavedLora): obj is SavedLora => {
    return (obj as SavedLora)._civitAiType === 'LORA'
  }

  const handleUseLoraClick = useCallback(
    (savedLoraOrEmbedding: SavedEmbedding | SavedLora) => {
      if (!isSavedLora(savedLoraOrEmbedding)) {
        // If it's not a SavedLora, we do nothing.
        return
      }

      if (input.loras.length >= AppConstants.MAX_LORAS) {
        toastController({
          message: `Can't add more than ${AppConstants.MAX_LORAS} LoRAs.`,
          type: 'error'
        })
        return
      }

      const found =
        input.loras.filter(
          (lora) => String(lora.name) === String(savedLoraOrEmbedding.versionId)
        ) || ([] as unknown as SavedLora)
      if (found.length > 0) return

      const updateLoras = [...input.loras, savedLoraOrEmbedding]
      setInput({ loras: updateLoras })
    },
    [input, setInput]
  )

  return (
    <Section anchor="add-lora">
      <div className="row justify-between">
        <h2 className="row font-bold text-white">
          LoRAs{' '}
          <span className="text-xs font-normal">
            ({input.loras.length} / {AppConstants.MAX_LORAS})
          </span>
        </h2>
        <div className="row gap-1">
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: (
                  <Suspense>
                    <LoraSearch onUseLoraClick={handleUseLoraClick} />
                  </Suspense>
                ),
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
                  <Suspense>
                    <LoraSearch
                      onUseLoraClick={handleUseLoraClick}
                      searchType="favorite"
                    />
                  </Suspense>
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
                  <Suspense>
                    <LoraSearch
                      onUseLoraClick={handleUseLoraClick}
                      searchType="recent"
                    />
                  </Suspense>
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
          {input.loras.map((lora, idx) => (
            <div key={`${lora.name}_${idx}`} className="w-full col">
              <LoraSettingsCard lora={lora} />
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
