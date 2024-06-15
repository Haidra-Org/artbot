'use client'
import { useInput } from '@/app/_providers/PromptInputProvider'
import NumberInput from '../NumberInput'
import OptionLabel from './OptionLabel'

export default function Steps() {
  const { input, setInput } = useInput()

  return (
    <OptionLabel
      className="row md:row"
      title={
        <span className="row font-bold text-sm text-white gap-1">Steps</span>
      }
    >
      <div className="">
        <NumberInput
          min={1}
          max={50}
          onBlur={() => {
            if (isNaN(input.steps)) {
              setInput({ steps: 24 })
            } else {
              setInput({
                steps: parseFloat(Number(input.steps).toFixed(0))
              })
            }
          }}
          onChange={(num) => {
            setInput({ steps: num as unknown as number })
          }}
          onMinusClick={() => {
            if (Number(input.steps) - 1 < 1) {
              return
            }

            setInput({ steps: Number(input.steps) - 1 })
          }}
          onPlusClick={() => {
            if (Number(input.steps) + 1 > 50) {
              return
            }

            setInput({ steps: Number(input.steps) + 1 })
          }}
          value={input.steps}
        />
      </div>
    </OptionLabel>
  )
}
