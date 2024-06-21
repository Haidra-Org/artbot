import {
  AiHordeEmbedding,
  ImageOrientations,
  JobType
} from '@/app/_types/ArtbotTypes'
import {
  ControlTypes,
  SourceProcessing,
  StylePresetConfig
} from '@/app/_types/HordeTypes'
import { SavedLora } from './Civitai'

class PromptInput {
  // ArtBot ID for mainting relationships in IndexedDb
  artbot_id: string = ''

  // Fields used for AI Horde image requests
  cfg_scale: number = 5
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
  image_is_control: boolean = false
  imageOrientation: ImageOrientations = 'square'
  imageType: string = ''
  jobType: JobType = JobType.Text2Img
  karras: boolean = true
  loras: SavedLora[] = []
  models: Array<string> = ['AlbedoBase XL (SDXL)']
  negative: string = ''
  numImages: number = 1
  parentJobId: string = ''
  post_processing: Array<string> = []
  preset: Array<{
    name: string
    settings: StylePresetConfig
  }> = []
  prompt: string = ''
  return_control_map: boolean = false
  sampler: string = 'k_dpmpp_sde'
  seed: string = ''
  source_processing?: SourceProcessing = SourceProcessing.Prompt
  steps: number = 20
  tiling: boolean = false
  tis: AiHordeEmbedding[] = []
  triggers: Array<string> = []
  upscaled: boolean = false
  width: number = 1024
  workflow?: 'qr_code' | ''

  constructor(params: Partial<PromptInput> = {}) {
    Object.assign(this, params)
  }
}

export default PromptInput
