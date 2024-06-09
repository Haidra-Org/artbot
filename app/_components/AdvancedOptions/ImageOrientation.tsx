'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import { ImageOrientations } from '@/app/_types/ArtbotTypes'
import Select from '../Select'
import OptionLabel from './OptionLabel'
import Button from '../Button'
import { IconCrop } from '@tabler/icons-react'
import NiceModal from '@ebay/nice-modal-react'
import CustomImageOrientation from './ImageOrientation_Custom'

interface Option {
  id: ImageOrientations
  label: string
  orientation: string
  height: number
  width: number
}

interface Options {
  [key: string]: Option
}

const options: Options = {
  landscape_16x9: {
    id: 'landscape_16x9',
    label: 'Landscape (16 x 9)',
    orientation: 'landscape-16x9',
    height: 576,
    width: 1024
  },
  landscape_3x2: {
    id: 'landscape_3x2',
    label: 'Landscape (3 x 2)',
    orientation: 'landscape',
    height: 704,
    width: 1024
  },
  portrait_2x3: {
    id: 'portrait_2x3',
    label: 'Portrait (2 x 3)',
    orientation: 'portrait',
    height: 1024,
    width: 704
  },
  phone_bg_9x21: {
    id: 'phone_bg_9x21',
    label: 'Phone background (9 x 21)',
    orientation: 'phone-bg',
    height: 1024,
    width: 448
  },
  ultrawide_21x9: {
    id: 'ultrawide_21x9',
    label: 'Ultrawide (21 x 9)',
    orientation: 'ultrawide',
    height: 448,
    width: 1024
  },
  square: {
    id: 'square',
    label: 'Square',
    orientation: 'square',
    height: 1024,
    width: 1024
  }
}

// Transforming the structure to Array<{id, label}>
const transformedOptions: Array<{ value: string; label: string }> =
  Object.values(options).map((option) => ({
    value: option.id,
    label: option.label
  }))

export default function ImageOrientation() {
  const { input, setInput } = useInput()

  return (
    <div className="col">
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">Aspect</span>
        }
      >
        <div className="col w-full">
          <Select
            onChange={(option) => {
              setInput({
                imageOrientation: option.value as ImageOrientations,
                height: options[option.value as ImageOrientations].height,
                width: options[option.value as ImageOrientations].width
              })
            }}
            options={transformedOptions}
            value={{
              value: input.imageOrientation,
              label: options[input.imageOrientation].label
            }}
          />
        </div>
        <Button
          onClick={() => {
            NiceModal.show('modal', {
              children: (
                <CustomImageOrientation input={input} setInput={setInput} />
              )
            })
          }}
        >
          <IconCrop />
        </Button>
      </OptionLabel>
      <div className="text-sm font-mono w-full text-right">
        {input.width}w x {input.height}h
      </div>
    </div>
  )
}
