'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import React from 'react'
import NumberInput from '../NumberInput'
import OptionLabel from './OptionLabel'

export default function ImageCount() {
  const { input, setInput } = useInput()

  return (
    <OptionLabel
      className="!row md:row"
      title={
        <span className="row font-bold text-sm text-white gap-1">Images</span>
      }
    >
      <div className="">
        <NumberInput
          min={1}
          max={20}
          onBlur={() => {
            if (isNaN(input.numImages)) {
              setInput({ numImages: 1 })
            } else {
              setInput({
                numImages: parseFloat(Number(input.numImages).toFixed(0))
              })
            }
          }}
          onChange={(num) => {
            setInput({ numImages: num as unknown as number })
          }}
          onMinusClick={() => {
            if (Number(input.numImages) - 1 < 1) {
              return
            }

            setInput({ numImages: Number(input.numImages) - 1 })
          }}
          onPlusClick={() => {
            if (Number(input.numImages) + 1 > 20) {
              return
            }

            setInput({ numImages: Number(input.numImages) + 1 })
          }}
          value={input.numImages}
        />
      </div>
    </OptionLabel>
  )
}
