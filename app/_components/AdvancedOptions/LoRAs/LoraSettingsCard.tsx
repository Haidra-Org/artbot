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
  const [strength, setStrength] = useState(lora.strength)
  const [clip, setClip] = useState(lora.clip)

  const loraIndex = input.loras.findIndex(
    (l) => String(l.versionId) === String(lora.versionId)
  )

  const handleRemoveLora = () => {
    const updateLoras = input.loras.filter(
      (l) => String(l.versionId) !== String(lora.versionId)
    )

    setInput({ loras: updateLoras })
  }

  const handleUpdateLora = (type: 'strength' | 'clip', value: number) => {
    // Map through the loras array and update the specific Lora
    const updateLoras = input.loras.map((l) => {
      if (String(l.versionId) === String(lora.versionId)) {
        // Return a new instance of SaveLora with the updated property
        return new SavedLora({
          ...l,
          [type]: parseFloat(value.toFixed(2)) // Ensure the value is correctly formatted
        })
      }
      return l // Return the unchanged Lora
    })

    setStrength(value)
    setInput({ loras: updateLoras })
  }

  const currentVersion = lora.modelVersions.filter(
    (ver) => ver.id === lora.versionId
  )

  return (
    <div className="rounded bg-[#1d4d74] p-2 col">
      <div className="w-full row justify-between text-sm font-mono font-bold text-white">
        {lora.isArtbotManualEntry ? (
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
              if (isNaN(strength)) {
                setStrength(1.0)
              } else {
                const updatedLoras = updateSaveLoraProperty({
                  loras: input.loras,
                  index: loraIndex,
                  updates: { strength: parseFloat(Number(strength).toFixed(2)) }
                })

                setStrength(parseFloat(Number(strength).toFixed(2)))
                setInput({
                  loras: updatedLoras
                })
              }
            }}
            onChange={(num) => {
              handleUpdateLora('strength', num as unknown as number)
            }}
            onMinusClick={() => {
              if (Number(strength) - 0.05 < -5.0) {
                return
              }
              const updatedLoras = updateSaveLoraProperty({
                loras: input.loras,
                index: loraIndex,
                updates: {
                  strength: parseFloat(Number(strength - 0.05).toFixed(2))
                }
              })

              setStrength(parseFloat(Number(strength - 0.05).toFixed(2)))
              setInput({
                loras: updatedLoras
              })
            }}
            onPlusClick={() => {
              if (Number(strength) + 0.05 > 5.0) {
                return
              }

              const updatedLoras = updateSaveLoraProperty({
                loras: input.loras,
                index: loraIndex,
                updates: {
                  strength: parseFloat(Number(strength + 0.05).toFixed(2))
                }
              })

              setStrength(parseFloat(Number(strength + 0.05).toFixed(2)))
              setInput({
                loras: updatedLoras
              })
            }}
            value={lora.strength}
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
              if (isNaN(clip)) {
                setClip(1.0)
              } else {
                const updatedLoras = updateSaveLoraProperty({
                  loras: input.loras,
                  index: loraIndex,
                  updates: {
                    clip: parseFloat(Number(clip).toFixed(2))
                  }
                })

                setClip(parseFloat(Number(clip).toFixed(2)))
                setInput({
                  loras: updatedLoras
                })
              }
            }}
            onChange={(num) => {
              handleUpdateLora('clip', num as unknown as number)
            }}
            onMinusClick={() => {
              if (Number(clip) - 0.05 < -5.0) {
                return
              }

              const updatedLoras = updateSaveLoraProperty({
                loras: input.loras,
                index: loraIndex,
                updates: {
                  clip: parseFloat(Number(clip - 0.05).toFixed(2))
                }
              })

              setClip(parseFloat(Number(clip - 0.05).toFixed(2)))
              setInput({
                loras: updatedLoras
              })
            }}
            onPlusClick={() => {
              if (Number(clip) + 0.05 > 5.0) {
                return
              }

              const updatedLoras = updateSaveLoraProperty({
                loras: input.loras,
                index: loraIndex,
                updates: {
                  clip: parseFloat(Number(clip + 0.05).toFixed(2))
                }
              })

              setClip(parseFloat(Number(clip + 0.05).toFixed(2)))
              setInput({
                loras: updatedLoras
              })
            }}
            value={lora.clip}
          />
        </div>
      </OptionLabel>
    </div>
  )
}
