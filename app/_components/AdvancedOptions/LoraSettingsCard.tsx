import { SavedLora } from '@/app/_types/ArtbotTypes'
import Button from '../Button'
import { IconInfoCircle, IconTrash } from '@tabler/icons-react'
import { useInput } from '@/app/_providers/PromptInputProvider'
import NumberInput from '../NumberInput'
import OptionLabel from './OptionLabel'
import { useState } from 'react'
import DeleteConfirmation from '../Modal_DeleteConfirmation'
import NiceModal from '@ebay/nice-modal-react'
import LoraDetails from './LoraDetails'

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
    const updateLoras = input.loras.map((l) => {
      if (String(l.versionId) === String(lora.versionId)) {
        return {
          ...l,
          [type]: value
        }
      }

      return l
    })

    setStrength(value)
    setInput({ loras: updateLoras })
  }

  return (
    <div className="rounded bg-[#1d4d74] p-2 col">
      <div className="w-full row justify-between text-sm font-mono">
        <div>
          {lora.name === lora.versionId ? (
            <span>LoRA by Version ID: {lora.name}</span>
          ) : (
            <span>{lora.name}</span>
          )}
        </div>
        <div className="row gap-2">
          <Button
            disabled={lora.name === lora.versionId}
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
          title={
            <span className="row font-bold text-sm text-white gap-1">
              Version:
            </span>
          }
        >
          <span className="font-mono font-normal pl-4">
            {lora.modelVersions[0].name}
          </span>
        </OptionLabel>
      )}
      <OptionLabel
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
                const updatedLoras = [...input.loras]
                updatedLoras[loraIndex] = {
                  ...updatedLoras[loraIndex],
                  strength: parseFloat(Number(strength).toFixed(2))
                }
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

              const updatedLoras = [...input.loras]
              updatedLoras[loraIndex] = {
                ...updatedLoras[loraIndex],
                strength: parseFloat(Number(strength - 0.05).toFixed(2))
              }

              setStrength(parseFloat(Number(strength - 0.05).toFixed(2)))
              setInput({
                loras: updatedLoras
              })
            }}
            onPlusClick={() => {
              if (Number(strength) + 0.05 > 5.0) {
                return
              }

              const updatedLoras = [...input.loras]
              updatedLoras[loraIndex] = {
                ...updatedLoras[loraIndex],
                strength: parseFloat(Number(strength + 0.05).toFixed(2))
              }

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
                const updatedLoras = [...input.loras]
                updatedLoras[loraIndex] = {
                  ...updatedLoras[loraIndex],
                  clip: parseFloat(Number(clip).toFixed(2))
                }
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

              const updatedLoras = [...input.loras]
              updatedLoras[loraIndex] = {
                ...updatedLoras[loraIndex],
                clip: parseFloat(Number(clip - 0.05).toFixed(2))
              }

              setClip(parseFloat(Number(clip - 0.05).toFixed(2)))
              setInput({
                loras: updatedLoras
              })
            }}
            onPlusClick={() => {
              if (Number(clip) + 0.05 > 5.0) {
                return
              }

              const updatedLoras = [...input.loras]
              updatedLoras[loraIndex] = {
                ...updatedLoras[loraIndex],
                clip: parseFloat(Number(clip + 0.05).toFixed(2))
              }

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
