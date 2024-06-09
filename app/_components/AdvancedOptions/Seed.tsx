'use client'

import { useInput } from '@/app/_providers/PromptInputProvider'
import React from 'react'
import OptionLabel from './OptionLabel'

export default function Seed() {
  const { input, setInput } = useInput()

  return (
    <OptionLabel
      title={
        <span className="row font-bold text-sm text-white gap-1">Seed</span>
      }
    >
      <div className="w-full">
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(e) => setInput({ seed: e.target.value })}
          // onKeyDown={handleKeyDown}
          value={input.seed}
        />
      </div>
    </OptionLabel>
  )
}
