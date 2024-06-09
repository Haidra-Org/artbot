'use client'
import React from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import styles from './numberInput.module.css'
import clsx from 'clsx'
import Button from '../Button'

interface NumberInputProps {
  disabled?: boolean
  min?: number
  max?: number
  value?: number
  onBlur?: () => void
  onChange: (value: string) => void
  onMinusClick: () => void
  onPlusClick: () => void
}

const NumberInput: React.FC<NumberInputProps> = ({
  disabled = false,
  min = 0,
  max = 100,
  value,
  onBlur = () => {},
  onChange = () => {},
  onMinusClick = () => {},
  onPlusClick = () => {}
}) => {
  const handleMinusClick = () => {
    if (Number(value) <= min || disabled) {
      return
    }

    onMinusClick()
  }

  const handlePlusClick = () => {
    if (Number(value) >= max || disabled) {
      return
    }

    onPlusClick()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e = e || window.event

    if (disabled) {
      return
    }

    if (e.code === 'ArrowUp' || e.code === 'Equal' || e.code === 'NumpadAdd') {
      e.preventDefault()
      handlePlusClick()
    }

    if (
      e.code === 'ArrowDown' ||
      e.code === 'Minus' ||
      e.code === 'NumpadSubtract'
    ) {
      e.preventDefault()
      handleMinusClick()
    }
  }

  return (
    <div className="row gap-0 items-start">
      <input
        className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-r-none"
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        value={value}
      />
      <div className="row gap-0">
        <Button
          className="!rounded-l-none !rounded-r-none !border !border-gray-300 dark:!border-gray-600"
          onClick={() => {
            // e.preventDefault()
            handleMinusClick()
          }}
        >
          <IconMinus />
        </Button>
        <Button
          className="!rounded-l-none !border !border-l-0 !border-gray-300 dark:!border-gray-600"
          onClick={() => {
            // e.preventDefault()
            handlePlusClick()
          }}
        >
          <IconPlus />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="row bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2">
      <input
        className="bg-gray-50 text-gray-900 text-[16px] rounded-lg block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        value={value}
      />
      <div className="row gap-0">
        <button
          disabled={Number(value) <= min}
          className={clsx(styles.Button, {
            [styles.ButtonDisabled]: Number(value) <= min
          })}
          onClick={(e) => {
            e.preventDefault()
            handleMinusClick()
          }}
        >
          <IconMinus />
        </button>
        <button
          disabled={Number(value) >= max}
          className={clsx(styles.Button, {
            [styles.ButtonDisabled]: Number(value) >= max
          })}
          onClick={(e) => {
            e.preventDefault()
            handlePlusClick()
          }}
        >
          <IconPlus />
        </button>
      </div>
    </div>
  )
}

export default NumberInput
