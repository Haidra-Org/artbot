'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import { useEffect, useState } from 'react'
import OptionLabel from './OptionLabel'
import Select from '../Select'
import NumberInput from '../NumberInput'

export type FaceFixProcessors = 'GFPGAN' | 'CodeFormers'
export type FixFixProcessorSelect = FaceFixProcessors | ''

export const OptionsArray = [
  { value: '', label: 'None' },
  {
    value: 'CodeFormers',
    label: 'CodeFormers'
  },
  {
    value: 'GFPGAN',
    label: 'GFPGAN'
  }
]

export default function FaceFixers() {
  const { input, setInput } = useInput()
  const [processor, setProcessor] = useState<FaceFixProcessors | 'None'>('None')

  useEffect(() => {
    const processors = input.post_processing as FaceFixProcessors[]

    if (processors.includes('GFPGAN')) {
      setProcessor('GFPGAN')
    }

    if (processors.includes('CodeFormers')) {
      setProcessor('CodeFormers')
    }
  }, [input.post_processing])

  return (
    <div className="col">
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">
            Face fixer
          </span>
        }
      >
        <div className="w-full">
          <Select
            // @ts-expect-error Values are casted as strings
            onChange={(option: {
              value: FaceFixProcessors | ''
              label: FaceFixProcessors | 'None'
            }) => {
              const filteredValues = input.post_processing.filter(
                (value) => value !== 'GFPGAN' && value !== 'CodeFormers'
              )

              setProcessor(option.label)

              if (option.label !== 'None') {
                setInput({
                  post_processing: [...filteredValues, option.value]
                })
              } else {
                setInput({
                  facefixer_strength: 0.5,
                  post_processing: filteredValues
                })
              }
            }}
            options={OptionsArray}
            value={{
              value: processor,
              label: processor ? processor : 'None'
            }}
          />
        </div>
      </OptionLabel>
      {(processor === 'GFPGAN' || processor === 'CodeFormers') && (
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
                if (isNaN(input.facefixer_strength)) {
                  setInput({ facefixer_strength: 0.05 })
                } else {
                  setInput({
                    facefixer_strength: parseFloat(
                      Number(input.facefixer_strength).toFixed(2)
                    )
                  })
                }
              }}
              onChange={(num) => {
                setInput({ facefixer_strength: num as unknown as number })
              }}
              onMinusClick={() => {
                if (Number(input.facefixer_strength) - 0.05 < 0.05) {
                  return
                }

                const updatedValue = (
                  Number(input.facefixer_strength) - 0.05
                ).toFixed(2)

                setInput({
                  facefixer_strength: parseFloat(updatedValue)
                })
              }}
              onPlusClick={() => {
                if (Number(input.facefixer_strength) + 0.05 > 1) {
                  return
                }

                const updatedValue = (
                  Number(input.facefixer_strength) + 0.05
                ).toFixed(2)

                setInput({
                  facefixer_strength: parseFloat(updatedValue)
                })
              }}
              value={input.facefixer_strength}
            />
          </div>
        </OptionLabel>
      )}
    </div>
  )
}
