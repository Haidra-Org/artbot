import { Dispatch, useState } from 'react'
import NumberInput from '../NumberInput'
import OptionLabel from './OptionLabel'
import { IconArrowsShuffle, IconLock, IconLockOpen } from '@tabler/icons-react'
import Button from '../Button'
import PromptInput from '@/app/_data-models/PromptInput'
import useImageSize from '@/app/_hooks/useImageSize'

export default function CustomImageOrientation({
  input,
  setInput
}: {
  input: PromptInput
  setInput: Dispatch<Partial<PromptInput>>
}) {
  // Need to track internal state for input here since this component
  // does not have access to PromptInputProvider since it's called via
  // NiceModal.
  const [height, setHeight] = useState(input.height)
  const [width, setWidth] = useState(input.width)
  const { getNewDimensions, updateAspectRatio } = useImageSize(
    input.width,
    input.height
  )
  const [lockRatio, setLockRatio] = useState(true)

  const handleSetDimensions = (w: number, h: number) => {
    setHeight(h)
    setWidth(w)
    setInput({ height: h, width: w })
  }

  return (
    <div className="col">
      <h2 className="row font-bold">Custom image size</h2>
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">Width</span>
        }
      >
        <div className="">
          <NumberInput
            min={64}
            max={3072}
            onBlur={() => {
              if (isNaN(width)) {
                setWidth(1024)
                setInput({ width: 1024 })
              } else {
                setWidth(parseFloat(Number(width).toFixed(0)))
                setInput({ width: parseFloat(Number(width).toFixed(0)) })
              }
            }}
            onChange={(num) => {
              handleSetDimensions(num as unknown as number, height)
            }}
            onMinusClick={() => {
              if (Number(width) - 64 < 64) {
                return
              }

              if (lockRatio) {
                const { adjustedWidth, adjustedHeight } = getNewDimensions({
                  w: width,
                  h: height,
                  size: Number(width) - 64,
                  side: 'width'
                })
                handleSetDimensions(adjustedWidth, adjustedHeight)
              } else {
                handleSetDimensions(Number(width) - 64, height)
              }
            }}
            onPlusClick={() => {
              if (Number(width) + 64 > 3072) {
                return
              }

              if (lockRatio) {
                const { adjustedWidth, adjustedHeight } = getNewDimensions({
                  w: width,
                  h: height,
                  size: Number(width) + 64,
                  side: 'width'
                })
                handleSetDimensions(adjustedWidth, adjustedHeight)
              } else {
                handleSetDimensions(Number(width) + 64, height)
              }
            }}
            value={width}
          />
        </div>
      </OptionLabel>
      <OptionLabel
        title={
          <span className="row font-bold text-sm text-white gap-1">Height</span>
        }
      >
        <div className="">
          <NumberInput
            min={64}
            max={3072}
            onBlur={() => {
              if (isNaN(height)) {
                setHeight(1024)
                setInput({ height: 1024 })
              } else {
                setHeight(parseFloat(Number(height).toFixed(0)))
                setInput({
                  height: parseFloat(Number(height).toFixed(0))
                })
              }
            }}
            onChange={(num) => {
              handleSetDimensions(width, num as unknown as number)
            }}
            onMinusClick={() => {
              if (Number(height) - 64 < 64) {
                return
              }

              if (lockRatio) {
                const { adjustedWidth, adjustedHeight } = getNewDimensions({
                  w: width,
                  h: height,
                  size: Number(height) - 64,
                  side: 'height'
                })
                handleSetDimensions(adjustedWidth, adjustedHeight)
              } else {
                handleSetDimensions(width, Number(height) - 64)
              }
            }}
            onPlusClick={() => {
              if (Number(height) + 64 > 3072) {
                return
              }

              if (lockRatio) {
                const { adjustedWidth, adjustedHeight } = getNewDimensions({
                  w: width,
                  h: height,
                  size: Number(height) + 64,
                  side: 'height'
                })
                handleSetDimensions(adjustedWidth, adjustedHeight)
              } else {
                handleSetDimensions(width, Number(height) + 64)
              }
            }}
            value={height}
          />
        </div>
      </OptionLabel>
      <div className="w-full text-right row !justify-end">
        <Button
          onClick={() => {
            updateAspectRatio(width, height)
            setLockRatio(!lockRatio)
          }}
        >
          <span className="row">
            {lockRatio ? <IconLock /> : <IconLockOpen />}
            {lockRatio ? 'Locked ratio' : 'Unlocked ratio'}
          </span>
        </Button>
        <Button
          onClick={() => {
            const newHeight = width
            const newWidth = height
            updateAspectRatio(newWidth, newHeight)
            handleSetDimensions(newWidth, newHeight)
          }}
        >
          <span className="row">
            <IconArrowsShuffle /> Swap
          </span>
        </Button>
      </div>
    </div>
  )
}
