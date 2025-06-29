'use client';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import Button from '../Button';

interface NumberInputProps {
  disabled?: boolean;
  min?: number;
  max?: number;
  value?: number;
  onBlur?: () => void;
  onChange: (value: string) => void;
  onMinusClick: () => void;
  onPlusClick: () => void;
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
      return;
    }

    onMinusClick();
  };

  const handlePlusClick = () => {
    if (Number(value) >= max || disabled) {
      return;
    }

    onPlusClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e = e || window.event;

    if (disabled) {
      return;
    }

    if (e.code === 'ArrowUp' || e.code === 'Equal' || e.code === 'NumpadAdd') {
      e.preventDefault();
      handlePlusClick();
    }

    if (
      e.code === 'ArrowDown' ||
      e.code === 'Minus' ||
      e.code === 'NumpadSubtract'
    ) {
      e.preventDefault();
      handleMinusClick();
    }
  };

  return (
    <div className="row gap-0 items-start">
      <input
        className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[100px] p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 rounded-r-none"
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        pattern="[0-9]*"
        type="number"
        value={value}
      />
      <div className="row gap-0">
        <Button
          className="rounded-l-none! rounded-r-none! border! border-gray-300! dark:border-gray-600!"
          onClick={() => {
            // e.preventDefault()
            handleMinusClick();
          }}
        >
          <IconMinus />
        </Button>
        <Button
          className="rounded-l-none! border! border-l-0! border-gray-300! dark:border-gray-600!"
          onClick={() => {
            // e.preventDefault()
            handlePlusClick();
          }}
        >
          <IconPlus />
        </Button>
      </div>
    </div>
  );
};

export default NumberInput;
