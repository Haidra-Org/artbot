import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useApplyPreset } from './useApplyPreset';
import PromptInput from '../_data-models/PromptInput';
import {
  CategoryPreset,
  StylePresetConfigurations,
  StylePreviewConfigurations
} from '../_types/HordeTypes';
import { getPresetData } from '../_api/presets';

const validQueryParams = ['preset', 'model', 'steps', 'cfg_scale', 'clip'];

const queryParamMap: Record<string, keyof PromptInput> = {
  model: 'models',
  steps: 'steps',
  cfg_scale: 'cfg_scale',
  clip: 'clipskip'
};

export const useCustomQueryParams = (
  setInput: (input: Partial<PromptInput>) => void
) => {
  const searchParams = useSearchParams();
  const [presetData, setPresetData] = useState<{
    categories: CategoryPreset;
    presets: StylePresetConfigurations;
    previews: StylePreviewConfigurations;
  } | null>(null);

  const handleSelectPreset = useApplyPreset(setInput);

  const handleQueryParams = useCallback(async () => {
    const preset = searchParams.get('preset');

    if (preset) {
      // Fetch preset data only if a preset query param exists
      const data = await getPresetData();
      if (data.success && data.presets[preset]) {
        handleSelectPreset(preset, data.presets[preset]);
        setPresetData(data); // Save the data for other potential use
        return;
      }
    }

    // Handle other query params if no preset is present
    const queryParams: Partial<
      Record<keyof PromptInput, string | number | string[]>
    > = {};

    searchParams.forEach((value, param) => {
      if (validQueryParams.includes(param)) {
        const propName = queryParamMap[param as keyof typeof queryParamMap];
        if (propName) {
          if (propName === 'models') {
            queryParams[propName] = [value];
          } else if (
            propName === 'steps' ||
            propName === 'cfg_scale' ||
            propName === 'clipskip'
          ) {
            queryParams[propName] = Number(value);
          } else {
            queryParams[propName] = value;
          }
        }
      }
    });

    if (Object.keys(queryParams).length > 0) {
      setInput(queryParams as Partial<PromptInput>);
    }
  }, [searchParams, setInput, handleSelectPreset]);

  useEffect(() => {
    handleQueryParams();
  }, [handleQueryParams]);

  return presetData; // Return preset data if needed elsewhere
};
