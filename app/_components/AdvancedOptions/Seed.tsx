'use client';

import { useInput } from '@/app/_providers/PromptInputProvider';
import OptionLabel from './OptionLabel';
import Button from '../Button';
import { IconArrowBarLeft, IconDice5 } from '@tabler/icons-react';

export default function Seed() {
  const { input, setInput } = useInput();

  return (
    <OptionLabel
      title={
        <span className="row font-bold text-sm text-white gap-1">Seed</span>
      }
    >
      <div className="w-full row">
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(e) => setInput({ seed: e.target.value })}
          // onKeyDown={handleKeyDown}
          value={input.seed}
        />
        <div className="row gap-1">
          <Button
            title="Insert random seed"
            onClick={() => {
              const value = Math.abs(
                (Math.random() * 2 ** 32) | 0
              ) as unknown as string;
              setInput({ seed: value });
            }}
          >
            <IconDice5 />
          </Button>
          <Button
            disabled={input.seed === ''}
            theme="danger"
            title="Clear seed"
            onClick={() => {
              setInput({ seed: '' });
            }}
          >
            <IconArrowBarLeft />
          </Button>
        </div>
      </div>
    </OptionLabel>
  );
}
