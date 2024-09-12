import { useCallback } from 'react';
import PromptInput, {
  DEFAULT_TURBO_EULER_LORA
} from '@/app/_data-models/PromptInput';
import { SavedLora } from '@/app/_data-models/Civitai';
import { useStore } from 'statery';
import { ModelStore } from '@/app/_stores/ModelStore';
import { StylePresetConfig } from '../_types/HordeTypes';

export const useApplyPreset = (
  setInput: (input: Partial<PromptInput>) => void
) => {
  const { modelDetails } = useStore(ModelStore);

  const handleSelectPreset = useCallback(
    (option: string, presetSettings: StylePresetConfig) => {
      const updateInput: Partial<PromptInput> = {};

      Object.keys(presetSettings).forEach((key) => {
        if (key === 'prompt') return;

        if (key === 'model') {
          updateInput.models = [presetSettings.model];

          // Safely check if modelDetails[presetSettings.model] exists
          const modelDetail = modelDetails[presetSettings.model];
          if (modelDetail) {
            updateInput.modelDetails = {
              baseline: modelDetail.baseline,
              version: modelDetail.version
            };
          }
          return;
        }

        if (key === 'height' || key === 'width') {
          updateInput.imageOrientation = 'custom';
        }

        if (key === 'loras' && typeof presetSettings.loras !== 'undefined') {
          updateInput.loras = [];
          presetSettings.loras.forEach((lora) => {
            let updateLora: SavedLora;
            if (lora.name === DEFAULT_TURBO_EULER_LORA.versionId) {
              updateLora = DEFAULT_TURBO_EULER_LORA;
            } else {
              updateLora = new SavedLora({
                id: lora.name,
                versionId: lora.is_version ? Number(lora.name) : false,
                versionName: lora.name,
                isArtbotManualEntry: true,
                name: lora.name,
                strength: lora.model || 1,
                clip: lora.clip_skip || 1
              });
            }

            updateInput.loras?.push({ ...updateLora });
          });
          return;
        }

        if (key === 'enhance') return;

        // @ts-expect-error All fields should be handled properly as of this point.
        updateInput[key as keyof PromptInput] = presetSettings[key];
      });

      setInput({
        ...updateInput,
        preset: [{ name: option, settings: { ...presetSettings } }]
      });
    },
    [modelDetails, setInput]
  );

  return handleSelectPreset;
};
