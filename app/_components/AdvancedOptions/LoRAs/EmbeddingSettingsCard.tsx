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
import Select, { SelectOption } from '../../Select'
import { InjectTi } from '@/app/_types/HordeTypes'

interface UpdateSaveEmbeddingParams {
  tis: SavedEmbedding[]
  index: number
  updates: Partial<SavedEmbedding>
}

function roundToNearest005(value: number): number {
  return Math.round(value * 20) / 20
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
  const [strength, setStrength] = useState<string>(ti?.strength?.toString() || '0')

  const tiIndex = input.tis.findIndex((l) => String(l.id) === String(ti.id))

  const handleRemoveEmbedding = () => {
    const updateTis = input.tis.filter((l) => String(l.id) !== String(ti.id))

    setInput({ tis: updateTis })
  }

  const handleUpdateLora = (type: 'strength', value: string) => {
    if (value === '') {
      setStrength('')
    } else {
      const numericValue = parseFloat(value)
      if (!isNaN(numericValue)) {
        const roundedValue = roundToNearest005(numericValue)
        const formattedValue = parseFloat(roundedValue.toFixed(2))

        const updateTis = input.tis.map((l) => {
          if (String(l.id) === String(ti.id)) {
            return new SavedEmbedding({
              ...l,
              [type]: formattedValue
            })
          }
          return l
        })

        setStrength(formattedValue.toString())
        setInput({ tis: updateTis })
      }
    }
  }

  // NOTE: Not used right now, as AI Horde does not support TI versions
  // const currentVersion = ti.modelVersions.filter(
  //   (ver) => ver.id === ti.versionId
  // )

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
      {/* NOTE: AI Horde does not currently support TI versions */}
      {/* {ti?.modelVersions && ti.modelVersions[0] && (
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
      )} */}
      <OptionLabel
        className="row md:row"
        title={
          <span className="row font-bold text-sm text-white gap-1">Inject</span>
        }
      >
        <Select
          onChange={(option: SelectOption) => {
            const updatedTis = updateSaveLoraProperty({
              tis: input.tis,
              index: tiIndex,
              updates: {
                inject_ti: option.value as InjectTi
              }
            })

            setInput({ tis: updatedTis })
          }}
          options={[
            { value: 'prompt', label: 'Prompt' },
            { value: 'negprompt', label: 'Negative Prompt' },
            { value: 'none', label: 'None' }
          ]}
          value={{
            value: ti.inject_ti as string,
            label: ti.inject_ti as string
          }}
        />
      </OptionLabel>
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
                setStrength(ti.strength.toString())
              } else {
                const roundedValue = roundToNearest005(parseFloat(strength))
                const formattedValue = parseFloat(roundedValue.toFixed(2))
                const updatedTis = updateSaveLoraProperty({
                  tis: input.tis,
                  index: tiIndex,
                  updates: { strength: formattedValue }
                })

                setStrength(formattedValue.toString())
                setInput({ tis: updatedTis })
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
    </div>
  )
}
