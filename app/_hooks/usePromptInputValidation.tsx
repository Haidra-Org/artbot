import { useEffect, useState } from 'react';
import { useInput } from '../_providers/PromptInputProvider';
import { SourceProcessing } from '../_types/HordeTypes';
import { flattenKeywords } from '../_utils/arrayUtils';
import { AppSettings } from '../_data-models/AppSettings';
import { useStore } from 'statery';
import { ModelStore } from '../_stores/ModelStore';
import { Workflow } from '../_types/ArtbotTypes';
import { AppConstants } from '../_data-models/AppConstants';
import {
  DEFAULT_TURBO_EULER_LORA,
  DEFAULT_TURBO_SDE_LORA
} from '../_data-models/PromptInput';

export interface PromptError {
  message: string;
  type: 'critical' | 'warning';
}

export default function usePromptInputValidation(): [PromptError[], boolean] {
  const { input } = useInput();
  const { modelDetails } = useStore(ModelStore);

  const [errors, setErrors] = useState<PromptError[]>([]);
  const [hasCriticalError, setCriticalError] = useState(false);

  const baselineModel = modelDetails[input?.models[0]]?.baseline ?? '';

  useEffect(() => {
    let updateCriticalError = false;
    const updateErrors: PromptError[] = [];

    // Check for Embedding Keywords
    const tiTags: string[] = flattenKeywords(input.tis);
    let missingTiKeywords = tiTags.length > 0 ? true : false;
    tiTags.forEach((tag) => {
      if (input.prompt.includes(tag)) {
        missingTiKeywords = false;
      }
    });

    if (missingTiKeywords) {
      updateErrors.push({
        message: `Keyword tags for embedding not found within prompt.`,
        type: 'warning'
      });
    }

    // Check for LoRA Keywords
    const loraTags: string[] = flattenKeywords(input.loras);
    let missingKeywords = loraTags.length > 0 ? true : false;
    loraTags.forEach((tag) => {
      if (input.prompt.includes(tag)) {
        missingKeywords = false;
      }
    });

    if (missingKeywords) {
      updateErrors.push({
        message: `Keyword tags for LoRA not found in prompt.`,
        type: 'warning'
      });
    }

    const totalPromptLength = input.prompt.length + input.negative.length;

    // Prompt length
    if (totalPromptLength > 7000 && AppSettings.get('useReplacementFilter')) {
      updateErrors.push({
        message: `Total prompt is likely too long for replacement filter. Max 7,000 characters. Please shorten prompt or disable replacement filter. Current length: ${input.prompt.length}`,
        type: 'warning'
      });
    }

    if (
      input.models[0].toLowerCase().indexOf('pony') >= 0 &&
      input.clipskip < 2
    ) {
      updateErrors.push({
        message: `PonyXL-based models require CLIP setting of at least 2.`,
        type: 'critical'
      });
    }

    // filter through input.workflows and find element that matchs type==='qr_code', if so, console.log error
    const workflowBaselineMatch =
      baselineModel === 'stable diffusion 1' ||
      baselineModel === 'stable_diffusion_xl';
    input.workflows.forEach((workflow: Workflow) => {
      if (!workflow) return;

      if (workflow.type === 'qr_code' && !workflowBaselineMatch) {
        updateErrors.push({
          message: `QR code option only supported using Stable Diffusion 1.x or SDXL models`,
          type: 'critical'
        });
      }

      if (workflow.type === 'qr_code' && !workflow.text.trim()) {
        updateErrors.push({
          message: `QR code workflow requires text or URL`,
          type: 'critical'
        });
      }
    });

    // Check if using TurboMix LoRA with correct sampler
    if (
      input.loras.filter(
        (lora) => lora.versionId === DEFAULT_TURBO_EULER_LORA.versionId
      ).length > 0 &&
      input.sampler !== 'k_euler_a'
    ) {
      updateErrors.push({
        message: 'TurboMix Euler LoRA requires "k_euler_a" sampler',
        type: 'warning'
      });
    }

    // Check if using TurboMix LoRA with correct sampler
    if (
      input.loras.filter(
        (lora) => lora.versionId === DEFAULT_TURBO_SDE_LORA.versionId
      ).length > 0 &&
      input.sampler !== 'k_dpmpp_sde'
    ) {
      updateErrors.push({
        message: 'TurboMix LCM SDE LoRA requires "k_dpmpp_sde" sampler',
        type: 'warning'
      });
    }

    // Remix is only availble with Stable Cascade 1.0
    if (
      input.models[0] !== 'Stable Cascade 1.0' &&
      input.source_processing === SourceProcessing.Remix
    ) {
      updateErrors.push({
        message: 'Remix option can only be used with "Stable Cascade models',
        type: 'critical'
      });
    }

    // Max supported pixels
    if (input.height * input.width > AppConstants.MAX_IMAGE_PIXELS) {
      updateErrors.push({
        message: `Image size of ${(input.height * input.width).toLocaleString()} pixels larger than supported max of ${AppConstants.MAX_IMAGE_PIXELS.toLocaleString()} pixels. Try reducing image dimensions.`,
        type: 'critical'
      });
    }

    if (input.height * input.width < 576 * 576 && input.hires) {
      updateErrors.push({
        message: `Hi-res fix is not supported for images with less than ${(576 * 576).toLocaleString()} pixels (~576 x 576).  Disable hi-red fix or try increasing image dimensions.`,
        type: 'critical'
      });
    }

    updateErrors.forEach((err) => {
      if (err.type === 'critical') {
        updateCriticalError = true;
      }
    });

    setCriticalError(updateCriticalError);
    setErrors(updateErrors);
  }, [baselineModel, input]);

  return [errors, hasCriticalError];
}
