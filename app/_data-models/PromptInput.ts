import { ImageOrientations, JobType, Workflow } from '@/app/_types/ArtbotTypes'
import {
  ControlTypes,
  SourceProcessing,
  StylePresetConfig
} from '@/app/_types/HordeTypes'
import { SavedEmbedding, SavedLora } from './Civitai'

class PromptInput {
  // ArtBot ID for mainting relationships in IndexedDb
  artbot_id: string = ''

  // ArtBot specific fields
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
  imageOrientation: ImageOrientations = 'square'
  imageType: string = ''
  jobType: JobType = JobType.Text2Img
  karras: boolean = true
  loras: SavedLora[] = [
    new SavedLora({
      id: '247778',
      civitAiType: 'LORA',
      versionId: '247778',
      versionName: '',
      isArtbotManualEntry: true,
      name: 'SDXL | LCM TurboMix LoRA (SDE sampler)',
      strength: 1,
      clip: 1
    })
  ]
  models: Array<string> = ['AlbedoBase XL (SDXL)']
  modelDetails: {
    baseline: string
    version: string
  } = {
    baseline: '',
    version: ''
  }
  negative: string = ''
  numImages: number = 1
  parentJobId: string = ''
  post_processing: Array<string> = []
  prompt: string = ''
  return_control_map: boolean = false
  sampler: string = 'k_dpmpp_sde'
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
}

export default PromptInput
