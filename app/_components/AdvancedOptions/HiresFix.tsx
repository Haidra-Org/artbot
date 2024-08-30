'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import OptionLabel from './OptionLabel'
import Select from '../Select'
import NumberInput from '../NumberInput'

export type FaceFixProcessors = 'GFPGAN' | 'CodeFormers'
export type FixFixProcessorSelect = FaceFixProcessors | ''

export const OptionsArray = [
  { value: false, label: 'Disabled' },
  {
    value: true,
    label: 'Enabled'
  }
]

export default function HiresFix() {
  const { input, setInput } = useInput()

  return (
    <div className="col">
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">
            Hires fix
          </span>
        }
      >
        <div className="w-full">
          <Select
            // @ts-expect-error Values are casted as strings
            onChange={(option: {
              value: boolean
              label: 'Enabled' | 'Disabled'
            }) => {
              if (option.label === 'Enabled') {
                setInput({ hires: true })
              } else {
                setInput({ hires: false })
              }
            }}
            options={OptionsArray}
            value={{
              value: input.hires,
              label: input.hires ? 'Enabled' : 'Disabled'
            }}
          />
        </div>
      </OptionLabel>
      {input.hires && (
        <OptionLabel
          title={
            <span className="row font-bold text-sm text-white gap-1">
              Strength
            </span>
          }
        >
          <div className="">
            <NumberInput
              min={0.05}
              max={1.0}
              onBlur={() => {
                if (isNaN(input.hires_fix_denoising_strength)) {
                  setInput({ hires_fix_denoising_strength: 0.05 })
                } else {
                  setInput({
                    hires_fix_denoising_strength: parseFloat(
                      Number(input.hires_fix_denoising_strength).toFixed(2)
                    )
                  })
                }
              }}
              onChange={(num) => {
                setInput({
                  hires_fix_denoising_strength: Number(num) as unknown as number
                })
              }}
              onMinusClick={() => {
                if (Number(input.hires_fix_denoising_strength) - 0.05 < 0.05) {
                  return
                }

                const updatedValue = (
                  Number(input.hires_fix_denoising_strength) - 0.05
                ).toFixed(2)

                setInput({
                  hires_fix_denoising_strength: parseFloat(updatedValue)
                })
              }}
              onPlusClick={() => {
                if (Number(input.hires_fix_denoising_strength) + 0.05 > 1) {
                  return
                }

                const updatedValue = (
                  Number(input.hires_fix_denoising_strength) + 0.05
                ).toFixed(2)

                setInput({
                  hires_fix_denoising_strength: parseFloat(updatedValue)
                })
              }}
              value={input.hires_fix_denoising_strength}
            />
          </div>
        </OptionLabel>
      )}
    </div>
  )
}
