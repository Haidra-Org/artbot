import { ImageOrientations, JobType, Workflow } from '@/app/_types/ArtbotTypes'
import {
  ControlTypes,
  SamplerOption,
  SourceProcessing,
  StylePresetConfig
} from '@/app/_types/HordeTypes'
import { SavedEmbedding, SavedLora } from './Civitai'

export const DEFAULT_TURBO_SDE_LORA = new SavedLora({
  id: '247778',
  civitAiType: 'LORA',
  versionId: '247778',
  versionName: '',
  isArtbotManualEntry: true,
  name: 'SDXL | LCM TurboMix LoRA (SDE sampler)',
  strength: 1,
  clip: 1
})

export const DEFAULT_TURBO_EULER_LORA = new SavedLora({
  id: '246747',
  civitAiType: 'LORA',
  versionId: '246747',
  versionName: '',
  isArtbotManualEntry: true,
  name: 'SDXL | TurboMix LoRA (Euler sampler)',
  strength: 1,
  clip: 1
})

class PromptInput {
  // ArtBot ID for mainting relationships in IndexedDb
  artbot_id: string = ''

  // ArtBot specific fields
  imageOrientation: ImageOrientations = 'square'
  modelDetails: {
    baseline: string
    version: string
  } = {
      baseline: '',
      version: ''
    }
  notes: string = ''
  preset: Array<{
    name: string
    settings: StylePresetConfig
  }> = []

  // Fields used for AI Horde image requests
  cfg_scale: number = 2
  clipskip: number = 1
  control_type?: ControlTypes = '' as ControlTypes
  denoising_strength?: number | '' = 0.75
  dry_run: boolean = false
  extra_texts?: Array<{
    text: string
    reference: string
  }> | null = null
  facefixer_strength: number = 0.75
  height: number = 1024
  hires: boolean = false
  hires_fix_denoising_strength: number = 0.65
  image_is_control: boolean = false
  imageType: string = ''
  jobType: JobType = JobType.Text2Img
  karras: boolean = true
  loras: SavedLora[] = [
    DEFAULT_TURBO_EULER_LORA
  ]
  models: Array<string> = ['AlbedoBase XL (SDXL)']
  negative: string = ''
  numImages: number = 1
  parentJobId: string = ''
  post_processing: Array<string> = []
  prompt: string = ''
  return_control_map: boolean = false
  sampler: SamplerOption = 'k_euler_a'
  seed: string = ''
  source_processing?: SourceProcessing = SourceProcessing.Prompt
  steps: number = 8
  tiling: boolean = false
  tis: SavedEmbedding[] = []
  transparent: boolean = false
  triggers: Array<string> = []
  upscaled: boolean = false
  width: number = 1024
  workflows: Workflow[] = []

  constructor(params: Partial<PromptInput> = {}) {
    Object.assign(this, params)
  }

  /**
   * Checks if the prompt input is a default prompt. I've hardcoded some default values here
   * but this should be okay as any changes above will cause the below test to fail at built time.
   * @param input - The prompt input to check.
   * @returns True if the prompt input is a default prompt, false otherwise.
   */
  static isDefaultPromptInput(input: PromptInput): boolean {
    const hasTurboLora = input.loras.filter(lora => lora.versionId === DEFAULT_TURBO_EULER_LORA.versionId).length > 0
    const hasDefaultSampler = input.sampler === 'k_euler_a'
    const hasDefaultStepsAndCfgScale = input.models[0] === 'AlbedoBase XL (SDXL)' && Number(input.steps) === 8 && Number(input.cfg_scale) === 2
    const hasDefaultModelAndLora = input.models[0] === 'AlbedoBase XL (SDXL)' && hasTurboLora && hasDefaultSampler

    return hasDefaultStepsAndCfgScale || hasDefaultModelAndLora
  }

  /**
   * Sets the prompt input to a non-turbo default prompt. This occurs when a user
   * selects a non-SDXL turbo model, so we need to adjust steps and cfg_scale to
   * the non-turbo defaults.
   * @param input - The prompt input to set to a non-turbo default prompt.
   * @returns The prompt input set to a non-turbo default prompt.
   */
  static setNonTurboDefaultPromptInput(input: PromptInput): PromptInput {
    // Remove the LCM TurboMix LoRA if present
    input.loras = input.loras.filter(lora => lora.versionId != DEFAULT_TURBO_EULER_LORA.versionId);

    return new PromptInput({
      ...input,
      steps: 24,
      cfg_scale: 6
    })
  }

  /**
   * Sets the prompt input to a turbo default prompt. This occurs when a user
   * selects a SDXL turbo model, so we need to adjust steps, cfg_scale, and
   * add the TurboMix LoRA to the loras array.
   * @param input - The prompt input to set to a turbo default prompt.
   * @returns The prompt input set to a turbo default prompt.
   */
  static setTurboDefaultPromptInput(input: PromptInput): PromptInput {
    // Check if the TurboMix LoRA is not present in the input.loras array
    if (!input.loras.some(lora => lora.versionId == DEFAULT_TURBO_EULER_LORA.versionId)) {
      // If not present, add it to the beginning of the array
      input.loras.unshift(DEFAULT_TURBO_EULER_LORA);
    }




    return new PromptInput({
      ...input,
      steps: 8,
      cfg_scale: 2
    })
  }
}

export default PromptInput
