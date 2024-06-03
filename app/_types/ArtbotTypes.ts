import PromptInput from '../_data-models/PromptInput'
import { Embedding } from './CivitaiTypes'
import { InjectTi } from './HordeTypes'

export interface AiHordeEmbedding extends Embedding {
  strength: number
  inject_ti?: InjectTi
}

export interface FavoriteImage {
  artbot_id: string
  image_id: string
  favorited: boolean
}

export interface HordeJob {
  id?: number
  artbot_id: string
  horde_id: string
  created_timestamp: number
  updated_timestamp: number
  status: JobStatus
  errors?: Array<{ [key: string]: string }> | null
  queue_position: number | null
  init_wait_time: number | null
  wait_time: number | null
  images_requested: number
  images_completed: number
  images_failed: number
}

export type ImageOrientations =
  | 'landscape_16x9'
  | 'landscape_3x2'
  | 'portrait_2x3'
  | 'phone_bg_9x21'
  | 'ultrawide_21x9'
  | 'square'
  | 'custom'

export interface ImageRequest extends PromptInput {
  artbot_id: string
}

export enum JobStatus {
  Waiting = 'waiting', // waiting to submit to stable horde api
  Requested = 'requested', // Job sent to API, waiting for response.
  Queued = 'queued', // submitted and waiting
  Processing = 'processing', // image has been sent to a worker and is in-process
  Done = 'done', // finished
  Error = 'error' // something unfortunate has happened
}

export enum JobType {
  ControlNet = 'controlnet',
  Img2Img = 'img2img',
  Inpainting = 'inpainting',
  Outpainting = 'outpainting',
  Remix = 'remix',
  Text2Img = 'text2img',
  Upscaling = 'upscaling'
}

export interface PromptsHistory {
  artbot_id: string
  hash_id: string
  prompt: string // Not indexed
  promptWords: string[]
}

export interface PromptsJobMap {
  artbot_id: string
  prompt_id: number
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
