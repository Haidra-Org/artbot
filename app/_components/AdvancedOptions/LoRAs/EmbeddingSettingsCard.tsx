import Button from '../../Button'
import { IconInfoCircle, IconTrash } from '@tabler/icons-react'
import { useInput } from '@/app/_providers/PromptInputProvider'
import NumberInput from '../../NumberInput'
import OptionLabel from '../OptionLabel'
import { useState } from 'react'
import DeleteConfirmation from '../../Modal_DeleteConfirmation'
import NiceModal from '@ebay/nice-modal-react'
import LoraDetails from './LoraDetails'
import { SavedEmbedding } from '@/app/_data-models/Civitai'

interface UpdateSaveEmbeddingParams {
  tis: SavedEmbedding[]
  index: number
  updates: Partial<SavedEmbedding>
}

// Function to update specified properties of a SaveLora instance in an array
function updateSaveLoraProperty({
  tis,
  index,
  updates
}: UpdateSaveEmbeddingParams): SavedEmbedding[] {
  // Create a shallow copy of the array to avoid mutating the original array
  const updatedTis = [...tis]

  // Retrieve the current SaveLora instance to be updated
  const loraToUpdate = updatedTis[index] as SavedEmbedding

  // Create a new instance of SaveLora with the updated properties
  const updatedTi = new SavedEmbedding({
    ...loraToUpdate,
    ...updates, // Spread the updates to override specific properties

    // Ensure the updates for numeric properties are formatted correctly
    strength:
      updates.strength !== undefined
        ? parseFloat(Number(updates.strength).toFixed(2))
        : loraToUpdate.strength
  })

  // Replace the old instance with the updated one
  updatedTis[index] = updatedTi

  return updatedTis
}

export default function EmbeddingSettingsCard({ ti }: { ti: SavedEmbedding }) {
  const { input, setInput } = useInput()
  const [strength, setStrength] = useState(ti.strength)

  const loraIndex = input.loras.findIndex(
    (l) => String(l.versionId) === String(ti.versionId)
  )

  const handleRemoveEmbedding = () => {
    const updateTis = input.tis.filter(
      (l) => String(l.versionId) !== String(ti.versionId)
    )

    setInput({ tis: updateTis })
  }

  const handleUpdateLora = (type: 'strength' | 'clip', value: number) => {
    // Map through the loras array and update the specific Lora
    const updateLoras = input.loras.map((l) => {
      if (String(l.versionId) === String(ti.versionId)) {
        // Return a new instance of SaveLora with the updated property
        return new SavedEmbedding({
          ...l,
          [type]: parseFloat(value.toFixed(2)) // Ensure the value is correctly formatted
        })
      }
      return l // Return the unchanged Lora
    })

    setStrength(value)
    setInput({ tis: updateLoras })
  }

  const currentVersion = ti.modelVersions.filter(
    (ver) => ver.id === ti.versionId
  )

  return (
    <div className="rounded bg-[#1d4d74] p-2 col">
      <div className="w-full row justify-between text-sm font-mono font-bold text-white">
        {ti.isArtbotManualEntry ? (
          <span>LoRA by Version ID: {ti.name}</span>
        ) : (
          <span>{ti.name}</span>
        )}
        <div className="row gap-2">
          <Button
            disabled={ti.isArtbotManualEntry}
            onClick={() => {
              NiceModal.show('embeddingDetails', {
                children: <LoraDetails details={ti} />
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
                    deleteButtonTitle="Remove Embedding"
                    title="Remove Embedding?"
                    message={
                      <>
                        <p>
                          Are you sure you want to remove this Emedding from
                          your image request?
                        </p>
                      </>
                    }
                    onDelete={() => {
                      handleRemoveEmbedding()
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
      {ti?.modelVersions && ti.modelVersions[0] && (
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
                const updatedTis = updateSaveLoraProperty({
                  tis: input.tis,
                  index: loraIndex,
                  updates: { strength: parseFloat(Number(strength).toFixed(2)) }
                })

                setStrength(parseFloat(Number(strength).toFixed(2)))
                setInput({
                  tis: updatedTis
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
              const updatedTis = updateSaveLoraProperty({
                tis: input.tis,
                index: loraIndex,
                updates: {
                  strength: parseFloat(Number(strength - 0.05).toFixed(2))
                }
              })

              setStrength(parseFloat(Number(strength - 0.05).toFixed(2)))
              setInput({
                tis: updatedTis
              })
            }}
            onPlusClick={() => {
              if (Number(strength) + 0.05 > 5.0) {
                return
              }

              const updatedTis = updateSaveLoraProperty({
                tis: input.tis,
                index: loraIndex,
                updates: {
                  strength: parseFloat(Number(strength + 0.05).toFixed(2))
                }
              })

              setStrength(parseFloat(Number(strength + 0.05).toFixed(2)))
              setInput({
                tis: updatedTis
              })
            }}
            value={ti.strength}
          />
        </div>
      </OptionLabel>
    </div>
  )
}
