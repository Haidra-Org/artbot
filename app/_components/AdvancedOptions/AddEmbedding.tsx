'use client'

import { IconHeartSearch, IconHistory, IconPlus } from '@tabler/icons-react'
import Button from '../Button'
import Section from '../Section'
import NiceModal from '@ebay/nice-modal-react'
import LoraSearch from './LoRAs/LoraSearch'
import { Suspense, useCallback } from 'react'
import { SavedEmbedding, SavedLora } from '@/app/_data-models/Civitai'
import { useInput } from '@/app/_providers/PromptInputProvider'
import EmbeddingSettingsCard from './LoRAs/EmbeddingSettingsCard'

export default function AddEmbedding() {
  const { input, setInput } = useInput()

  // Define a type guard to check if the object is of type SavedLora
  const isSavedEmbedding = (
    obj: SavedEmbedding | SavedLora
  ): obj is SavedEmbedding => {
    return (obj as SavedEmbedding)._civitAiType === 'TextualInversion'
  }
  const handleUseLoraClick = useCallback(
    (savedLoraOrEmbedding: SavedEmbedding | SavedLora) => {
      if (!isSavedEmbedding(savedLoraOrEmbedding)) {
        // If it's not a SavedEmbedding, we do nothing.
        return
      }

      const found =
        input.tis.filter(
          (ti) => String(ti.name) === String(savedLoraOrEmbedding.versionId)
        ) || ([] as unknown as SavedLora)
      if (found.length > 0) return

      const updateTis = [...input.tis, savedLoraOrEmbedding]

      setInput({ tis: updateTis })
    },
    [input, setInput]
  )

  let title = `Embeddings`
  if (input.tis.length > 0) {
    title += ` (${input.tis.length})`
  }

  return (
    <Section
      accordion
      anchor="add-embedding"
      title={title}
    >
      <div className="row justify-end mb-2">
        <div className="row gap-1">
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: (
                  <Suspense>
                    <LoraSearch
                      onUseLoraClick={handleUseLoraClick}
                      civitAiType="TextualInversion"
                    />
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
                      civitAiType="TextualInversion"
                      searchType="favorite"
                    />
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
            <IconHeartSearch />
          </Button>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: (
                  <Suspense>
                    <LoraSearch
                      onUseLoraClick={handleUseLoraClick}
                      civitAiType="TextualInversion"
                      searchType="recent"
                    />
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
            <IconHistory />
          </Button>
        </div>
      </div>
      {input.tis.length > 0 && (
        <div className="w-full col">
          {input.tis.map((ti, idx) => (
            <div key={`${ti.name}_${idx}`} className="w-full col">
              <EmbeddingSettingsCard ti={ti} />
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
