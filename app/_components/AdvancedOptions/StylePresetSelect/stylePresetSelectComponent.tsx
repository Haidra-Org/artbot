'use client';

import { useInput } from '@/app/_providers/PromptInputProvider';
import OptionLabel from '../OptionLabel';
import { IconWand, IconX } from '@tabler/icons-react';
import Select from '../../Select';
import NiceModal from '@ebay/nice-modal-react';
import StylePresetModal from '../StylePresetModal';
import Button from '../../Button';
import {
  CategoryPreset,
  StylePresetConfigurations,
  StylePreviewConfigurations
} from '@/app/_types/HordeTypes';
import { useApplyPreset } from '@/app/_hooks/useApplyPreset';

export default function StylePresetSelectComponent({
  categories,
  presets,
  previews
}: {
  categories: CategoryPreset;
  presets: StylePresetConfigurations;
  previews: StylePreviewConfigurations;
  hasError: boolean;
}) {
  const { input, setInput } = useInput();
  const handleSelectPreset = useApplyPreset(setInput);

  let options = [
    {
      label: 'None',
      value: 'none'
    }
  ];

  if (input.preset.length > 0) {
    options = [
      {
        label: input.preset[0].name,
        value: input.preset[0].name
      }
    ];
  }

  return (
    <OptionLabel
      title={
        <span className="row font-bold text-sm text-white gap-1">
          Style preset
        </span>
      }
    >
      <div className="w-full row">
        <Select
          hideDropdown
          onClick={() => {
            NiceModal.show('modal', {
              children: (
                <StylePresetModal
                  categories={categories}
                  presets={presets}
                  previews={previews}
                  handleOnClick={(option: string) => {
                    handleSelectPreset(option, presets[option]);
                    NiceModal.remove('modal');
                  }}
                />
              ),
              modalClassName: 'w-full md:min-w-[640px] max-w-[648px]'
            });
          }}
          onChange={() => {}}
          options={options}
          value={options[0]}
        />
        <Button
          onClick={() => {
            const presetKeys = Object.keys(presets);
            const randomPreset =
              presetKeys[Math.floor(Math.random() * presetKeys.length)];
            handleSelectPreset(randomPreset, presets[randomPreset]);
          }}
        >
          <IconWand />
        </Button>
        <Button theme="danger" onClick={() => setInput({ preset: [] })}>
          <IconX />
        </Button>
      </div>
    </OptionLabel>
  );
}
