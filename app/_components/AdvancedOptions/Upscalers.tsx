'use client'

import { useEffect, useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { useInput } from '@/app/_providers/PromptInputProvider'
import Select from '../Select'
import Button from '../Button'
import OptionLabel from './OptionLabel'

export type UpscalerProcessors =
  | '4x_AnimeSharp'
  | 'NMKD_Siax'
  | 'RealESRGAN_x2plus'
  | 'RealESRGAN_x4plus_anime_6B'
  | 'RealESRGAN_x4plus'
export type UpscalerProcessorsSelect = UpscalerProcessors | ''

export const OptionsArray = [
  {
    value: '4x_AnimeSharp',
    label: '4x_AnimeSharp'
  },
  {
    value: 'NMKD_Siax',
    label: 'NMKD_Siax'
  },
  {
    value: 'RealESRGAN_x2plus',
    label: 'RealESRGAN_x2plus'
  },
  {
    value: 'RealESRGAN_x4plus_anime_6B',
    label: 'RealESRGAN_x4plus_anime_6B'
  },
  {
    value: 'RealESRGAN_x4plus',
    label: 'RealESRGAN_x4plus'
  }
]

export default function Upscalers() {
  const { input, setInput } = useInput()
  const [processors, setProcessors] = useState<UpscalerProcessors[]>([])

  const handleRemoveProcessor = (processor: UpscalerProcessors) => {
    const filteredProcessors = processors.filter((p) => p !== processor)
    const filteredInput = input.post_processing.filter((p) => p !== processor)

    setProcessors(filteredProcessors)
    setInput({ post_processing: filteredInput })
  }

  useEffect(() => {
    const processors = input.post_processing as UpscalerProcessors[]
    let initUpscalers = []

    // Filter for upscalers in order to keep initial order.
    initUpscalers = processors.filter((processor) => {
      return (
        processor === '4x_AnimeSharp' ||
        processor === 'NMKD_Siax' ||
        processor === 'RealESRGAN_x2plus' ||
        processor === 'RealESRGAN_x4plus_anime_6B' ||
        processor === 'RealESRGAN_x4plus'
      )
    })

    setProcessors(initUpscalers)
  }, [input.post_processing])

  return (
    <div className="col">
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">
            Upscalers
          </span>
        }
      >
        <div className="w-full">
          <Select
            // @ts-expect-error Values are casted as strings
            onChange={(option: {
              value: UpscalerProcessors
              label: UpscalerProcessors
            }) => {
              if (!processors.includes(option.value)) {
                const updatedProcessors = [...processors, option.value]
                setProcessors(updatedProcessors)

                setInput({
                  post_processing: [...input.post_processing, option.value]
                })
              }
            }}
            options={OptionsArray}
            value={{
              value: '',
              label: 'None'
            }}
          />
        </div>
      </OptionLabel>
      {processors.length > 0 && (
        <div className="col gap-3">
          {processors.map((processor) => (
            <div
              className="row  gap-3 font-mono"
              key={`upscale_processor-${processor}`}
            >
              <Button
                theme="danger"
                onClick={() => handleRemoveProcessor(processor)}
              >
                <IconTrash />
              </Button>
              {processor}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
