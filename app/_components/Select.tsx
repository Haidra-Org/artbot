import React, { useEffect, useRef, useState } from 'react';
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/react';
import { IconChevronDown } from '@tabler/icons-react';
import { useClickAway } from 'react-use';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}

export default function Select({
  disabled = false,
  hideDropdown = false,
  onChange = () => {},
  onClick = () => {},
  options,
  value
}: {
  disabled?: boolean;
  hideDropdown?: boolean;
  onChange: (option: SelectOption) => void;
  onClick?: (e: React.MouseEvent) => void;
  options: SelectOption[];
  value: SelectOption;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelection = (option: SelectOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div
      className="relative w-full"
      onClick={(value) => {
        if (disabled) return;
        onClick(value);
      }}
      ref={ref}
    >
      <Listbox value={value} onChange={handleSelection}>
        <ListboxButton
          className="relative cursor-default bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onClick={() => {
            if (disabled) return;

            if (!hideDropdown) {
              setIsOpen(!isOpen);
            }
          }}
        >
          <span className="flex items-center">
            <span className="block truncate">{value.label}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
            <IconChevronDown
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        {isOpen && (
          <ListboxOptions
            static
            className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-opacity-5 focus:outline-none sm:text-sm bg-gray-50 border border-gray-300 text-gray-900 text-[16px] focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
          >
            {options.map((option, idx) => (
              <ListboxOption
                key={`option-${idx}`}
                className={({ active }) =>
                  classNames(
                    active ? 'bg-indigo-600 ' : '',
                    'text-black dark:text-white relative cursor-default select-none py-2 pl-0 pr-9 hover:bg-indigo-600 hover:text-white'
                  )
                }
                value={option}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  onChange(option);
                  // setSelected(option)
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center">
                  <span
                    className={classNames(
                      value.value === option.value
                        ? 'font-semibold'
                        : 'font-normal',
                      'ml-1 block truncate'
                    )}
                  >
                    {option.label}
                  </span>
                </div>
              </ListboxOption>
            ))}
          </ListboxOptions>
        )}
      </Listbox>
    </div>
  );
}
