import Button from '../../Button'
import { IconInfoCircle, IconTrash } from '@tabler/icons-react'
import { useInput } from '@/app/_providers/PromptInputProvider'
import NumberInput from '../../NumberInput'
import OptionLabel from '../OptionLabel'
import { useState } from 'react'
import DeleteConfirmation from '../../Modal_DeleteConfirmation'
import NiceModal from '@ebay/nice-modal-react'
import LoraDetails from './LoraDetails'
import { SavedLora } from '@/app/_data-models/Civitai'

interface UpdateSaveLoraParams {
  loras: SavedLora[]
  index: number
  updates: Partial<SavedLora>
}

function roundToNearest005(value: number): number {
  return Math.round(value * 20) / 20
}

// Function to update specified properties of a SaveLora instance in an array
function updateSaveLoraProperty({
  loras,
  index,
  updates
}: UpdateSaveLoraParams): SavedLora[] {
  // Create a shallow copy of the array to avoid mutating the original array
  const updatedLoras = [...loras]

  // Retrieve the current SaveLora instance to be updated
  const loraToUpdate = updatedLoras[index]

  // Create a new instance of SaveLora with the updated properties
  const updatedLora = new SavedLora({
    ...loraToUpdate,
    ...updates, // Spread the updates to override specific properties
    // Ensure the updates for numeric properties are formatted correctly
    clip:
      updates.clip !== undefined
        ? parseFloat(Number(updates.clip).toFixed(2))
        : loraToUpdate.clip,
    strength:
      updates.strength !== undefined
        ? parseFloat(Number(updates.strength).toFixed(2))
        : loraToUpdate.strength
  })

  // Replace the old instance with the updated one
  updatedLoras[index] = updatedLora

  return updatedLoras
}

export default function LoraSettingsCard({ lora }: { lora: SavedLora }) {
  const { input, setInput } = useInput()
  const [strength, setStrength] = useState<string>(lora.strength.toString())
  const [clip, setClip] = useState<string>(lora.clip.toString())

  const loraIndex = input.loras.findIndex(
    (l) => String(l.versionId) === String(lora.versionId)
  )

  const handleRemoveLora = () => {
    const updateLoras = input.loras.filter(
      (l) => String(l.versionId) !== String(lora.versionId)
    )

    setInput({ loras: updateLoras })
  }

  const handleUpdateLora = (type: 'strength' | 'clip', value: string) => {
    if (value === '') {
      if (type === 'strength') setStrength('')
      else setClip('')
    } else {
      const numericValue = parseFloat(value)
      if (!isNaN(numericValue)) {
        const roundedValue = roundToNearest005(numericValue)
        const formattedValue = parseFloat(roundedValue.toFixed(2))

        const updateLoras = input.loras.map((l) => {
          if (String(l.versionId) === String(lora.versionId)) {
            return new SavedLora({
              ...l,
              [type]: formattedValue
            })
          }
          return l
        })

        if (type === 'strength') setStrength(formattedValue.toString())
        else setClip(formattedValue.toString())

        setInput({ loras: updateLoras })
      }
    }
  }

  const currentVersion = lora.modelVersions.filter(
    (ver) => ver.id === lora.versionId
  )

  return (
    <div className="rounded bg-[#1d4d74] p-2 col">
      <div className="w-full row justify-between text-sm font-mono font-bold text-white">
        {lora.isArtbotManualEntry && lora.id !== '247778' ? (
          <span>LoRA by Version ID: {lora.name}</span>
        ) : (
          <span>{lora.name}</span>
        )}
        <div className="row gap-2">
          <Button
            disabled={lora.isArtbotManualEntry}
            onClick={() => {
              NiceModal.show('embeddingDetails', {
                children: <LoraDetails details={lora} />
              })
            }}
          >
            <IconInfoCircle stroke={1.5} />
          </Button>
          <Button
            theme="danger"
            onClick={() => {
              NiceModal.show('delete', {
                children: (
                  <DeleteConfirmation
                    deleteButtonTitle="Remove LoRA"
                    title="Remove LoRA?"
                    message={
                      <>
                        <p>
                          Are you sure you want to remove this LoRA from your
                          image request?
                        </p>
                      </>
                    }
                    onDelete={() => {
                      handleRemoveLora()
                    }}
                  />
                )
              })
            }}
          >
            <IconTrash stroke={1.5} />
          </Button>
        </div>
      </div>
      {lora?.modelVersions && lora.modelVersions[0] && (
        <OptionLabel
          className="row md:row"
          title={
            <span className="row font-bold text-sm text-white gap-1">
              Version:
            </span>
          }
        >
          <span className="font-mono pl-4 text-white font-bold">
            {currentVersion && currentVersion[0].name}
          </span>
        </OptionLabel>
      )}
      <OptionLabel
        className="row md:row"
        title={
          <span className="row font-bold text-sm text-white gap-1">
            Strength
          </span>
        }
      >
        <div className="">
          <NumberInput
            min={-5.0}
            max={5.0}
            onBlur={() => {
              if (strength === '' || isNaN(parseFloat(strength))) {
                setStrength(lora.strength.toString())
              } else {
                const roundedValue = roundToNearest005(parseFloat(strength))
                const formattedValue = parseFloat(roundedValue.toFixed(2))
                const updatedLoras = updateSaveLoraProperty({
                  loras: input.loras,
                  index: loraIndex,
                  updates: { strength: formattedValue }
                })

                setStrength(formattedValue.toString())
                setInput({ loras: updatedLoras })
              }
            }}
            onChange={(value) => {
              handleUpdateLora('strength', value as string)
            }}
            onMinusClick={() => {
              const currentValue = parseFloat(strength) || 0
              if (currentValue - 0.05 < -5.0) return
              const newValue = roundToNearest005(currentValue - 0.05)
              handleUpdateLora('strength', newValue.toString())
            }}
            onPlusClick={() => {
              const currentValue = parseFloat(strength) || 0
              if (currentValue + 0.05 > 5.0) return
              const newValue = roundToNearest005(currentValue + 0.05)
              handleUpdateLora('strength', newValue.toString())
            }}
            value={strength as unknown as number}
          />
        </div>
      </OptionLabel>
      <OptionLabel
        className="!row md:row"
        title={
          <span className="row font-bold text-sm text-white gap-1">Clip</span>
        }
      >
        <div className="">
          <NumberInput
            min={-5.0}
            max={5.0}
            onBlur={() => {
              if (clip === '' || isNaN(parseFloat(clip))) {
                setClip(lora.clip.toString())
              } else {
                const roundedValue = roundToNearest005(parseFloat(clip))
                const formattedValue = parseFloat(roundedValue.toFixed(2))
                const updatedLoras = updateSaveLoraProperty({
                  loras: input.loras,
                  index: loraIndex,
                  updates: { clip: formattedValue }
                })

                setClip(formattedValue.toString())
                setInput({ loras: updatedLoras })
              }
            }}
            onChange={(value) => {
              handleUpdateLora('clip', value as string)
            }}
            onMinusClick={() => {
              const currentValue = parseFloat(clip) || 0
              if (currentValue - 0.05 < -5.0) return
              const newValue = roundToNearest005(currentValue - 0.05)
              handleUpdateLora('clip', newValue.toString())
            }}
            onPlusClick={() => {
              const currentValue = parseFloat(clip) || 0
              if (currentValue + 0.05 > 5.0) return
              const newValue = roundToNearest005(currentValue + 0.05)
              handleUpdateLora('clip', newValue.toString())
            }}
            value={clip as unknown as number}
          />
        </div>
      </OptionLabel>
    </div>
  )
}
