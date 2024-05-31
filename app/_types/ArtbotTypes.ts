import { Embedding } from './CivitaiTypes'
import { InjectTi } from './HordeTypes'

export interface AiHordeEmbedding extends Embedding {
  strength: number
  inject_ti?: InjectTi
}

export type ImageOrientations =
  | 'landscape_16x9'
  | 'landscape_3x2'
  | 'portrait_2x3'
  | 'phone_bg_9x21'
  | 'ultrawide_21x9'
  | 'square'
  | 'custom'

export enum JobType {
  ControlNet = 'controlnet',
  Img2Img = 'img2img',
  Inpainting = 'inpainting',
  Outpainting = 'outpainting',
  Remix = 'remix',
  Text2Img = 'text2img',
  Upscaling = 'upscaling'
}

export interface SavedLora {
  parentModelId: number
  name: string | number
  label: string
  versionLabel: string
  description: string
  baseModel: string
  trainedWords: string[]
  image: string
  sizeKb: number
  model: number // Strength
  clip: number
  is_version: boolean
}
