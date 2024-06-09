'use client'
import { useInput } from '@/app/_providers/PromptInputProvider'
import NumberInput from '../NumberInput'
import OptionLabel from './OptionLabel'

export default function Guidance() {
  const { input, setInput } = useInput()

  return (
    <OptionLabel
      title={
        <span className="row font-bold text-sm text-white gap-1">Guidance</span>
      }
    >
      <div className="">
        <NumberInput
          min={0.5}
          max={30}
          onBlur={() => {
            if (isNaN(input.cfg_scale)) {
              setInput({ cfg_scale: 7.5 })
            } else {
              setInput({
                cfg_scale: parseFloat(Number(input.cfg_scale).toFixed(1))
              })
            }
          }}
          onChange={(num) => {
            setInput({ cfg_scale: num as unknown as number })
          }}
          onMinusClick={() => {
            if (Number(input.cfg_scale) - 0.5 < 0.5) {
              return
            }

            setInput({ cfg_scale: Number(input.cfg_scale) - 0.5 })
          }}
          onPlusClick={() => {
            if (Number(input.cfg_scale) + 0.5 > 30) {
              return
            }

            setInput({ cfg_scale: Number(input.cfg_scale) + 0.5 })
          }}
          value={input.cfg_scale}
        />
      </div>
    </OptionLabel>
  )
}
