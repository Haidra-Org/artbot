'use client'
import { useInput } from '@/app/_providers/PromptInputProvider'
import NumberInput from '../NumberInput'
import OptionLabel from './OptionLabel'

export default function ClipSkip() {
  const { input, setInput } = useInput()

  return (
    <OptionLabel
      anchor="clip"
      className="row md:row"
      title={
        <span className="row font-bold text-sm text-white gap-1">
          CLIP Skip
        </span>
      }
    >
      <div className="">
        <NumberInput
          min={1}
          max={12}
          onChange={(num) => {
            setInput({ clipskip: num as unknown as number })
          }}
          onMinusClick={() => {
            if (Number(input.clipskip) - 1 < 1) {
              return
            }

            setInput({ clipskip: Number(input.clipskip) - 1 })
          }}
          onPlusClick={() => {
            if (Number(input.clipskip) + 1 > 12) {
              return
            }

            setInput({ clipskip: Number(input.clipskip) + 1 })
          }}
          value={input.clipskip}
        />
      </div>
    </OptionLabel>
  )
}
