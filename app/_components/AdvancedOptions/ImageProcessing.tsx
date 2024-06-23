'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import { SourceProcessing } from '@/app/_types/HordeTypes'
import { useEffect, useState } from 'react'
import Section from '../Section'
import Select from '../Select'
import PromptInput from '@/app/_data-models/PromptInput'
import NumberInput from '../NumberInput'
import OptionLabel from './OptionLabel'
import Switch from '../Switch'

type Options = Array<{ value: SourceProcessing; label: string }>

const processingOptions: Options = [
  { value: SourceProcessing.Img2Img, label: 'img2img' },
  { value: SourceProcessing.InPainting, label: 'inpainting' },
  { value: SourceProcessing.Remix, label: 'remix' }
]

export const CONTROL_TYPE_ARRAY = [
  '',
  'canny',
  'hed',
  'depth',
  'normal',
  'openpose',
  'seg',
  'scribble',
  'fakescribbles',
  'hough'
]

export default function ImageProcessing() {
  const { input, setInput, sourceImages } = useInput()
  const [controlType, setControlType] = useState({ value: '', label: 'none' })

  useEffect(() => {
    if (input.control_type) {
      setControlType({
        value: input.control_type,
        label: input.control_type
      })
    } else if (input.control_type === '') {
      setControlType({ value: '', label: 'none' })
    }
  }, [input.control_type])

  if (sourceImages.length === 0) {
    return null
  }

  return (
    <Section title="Image processing" anchor="image-processing">
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">
            Processing
          </span>
        }
      >
        <div className="w-full">
          <Select
            onChange={(option) => {
              if (option.value == SourceProcessing.Remix) {
                setControlType({ value: '', label: 'none' })
                setInput({
                  control_type: undefined,
                  denoising_strength: undefined,
                  image_is_control: false,
                  models: ['Stable Cascade 1.0'],
                  source_processing: option.value as SourceProcessing
                })
              } else {
                const inputOptions: Partial<PromptInput> = {
                  source_processing: option.value as SourceProcessing
                }

                if (
                  !input.denoising_strength &&
                  option.value === SourceProcessing.Img2Img
                ) {
                  inputOptions.denoising_strength = 0.75
                }

                setInput(inputOptions)
              }
            }}
            options={[...processingOptions]}
            value={{
              value: input.source_processing as SourceProcessing,
              label: input.source_processing as SourceProcessing
            }}
          />
        </div>
      </OptionLabel>
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">
            Denoise
          </span>
        }
      >
        <div className="">
          <NumberInput
            min={0}
            max={1}
            onBlur={() => {
              if (isNaN(input.denoising_strength as number)) {
                setInput({ denoising_strength: 0.5 })
              } else {
                setInput({
                  denoising_strength: parseFloat(
                    Number(input.denoising_strength).toFixed(2)
                  )
                })
              }
            }}
            onChange={(num) => {
              setInput({ denoising_strength: num as unknown as number })
            }}
            onMinusClick={() => {
              if (Number(input.denoising_strength) - 0.05 < 0) {
                return
              }

              setInput({
                denoising_strength: parseFloat(
                  (Number(input.denoising_strength) - 0.05).toFixed(2)
                )
              })
            }}
            onPlusClick={() => {
              if (Number(input.denoising_strength) + 0.05 > 1) {
                return
              }

              setInput({
                denoising_strength: parseFloat(
                  (Number(input.denoising_strength) + 0.05).toFixed(2)
                )
              })
            }}
            value={input.denoising_strength as number}
          />
        </div>
      </OptionLabel>
      <div className="" />
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">
            ControlNet
          </span>
        }
      >
        <div className="w-full">
          <Select
            // TODO: Fix me
            // isDisabled={input.source_processing === SourceProcessing.Remix}
            onChange={(option) => {
              setInput({
                // @ts-expect-error We know SourceProcessingType
                control_type: option.value as SourceProcessingType
              })
            }}
            options={CONTROL_TYPE_ARRAY.map((value) => {
              if (value === '') {
                return { value: '', label: 'none' }
              }

              return { value, label: value }
            })}
            value={controlType}
          />
        </div>
      </OptionLabel>
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">
            Control image?
          </span>
        }
      >
        <Switch
          checked={input.image_is_control}
          disabled={input.source_processing === SourceProcessing.Remix}
          onChange={() => {
            setInput({ image_is_control: !input.image_is_control })
          }}
        />
      </OptionLabel>
    </Section>
  )
}
