import { Embedding } from '../_data-models/Civitai'
import PromptInput from '../_data-models/PromptInput'
import { GenMetadata, InjectTi } from './HordeTypes'

export interface AiHordeEmbedding extends Embedding {
  strength: number
  inject_ti?: InjectTi
}

type AppSettingsTableKeys = 'favoriteModels' | 'imageSize'

export type AppSettingsTable = {
  id?: number
  key: AppSettingsTableKeys
  value: string[] | string | number | boolean
}

// Simplified CivitAi types that ArtBot will use to cast API requests to the proper type
export type CivitAiBaseModels = 'SDXL' | 'Pony' | 'SD 1.x' | 'SD 2.x' | 'NSFW'

export interface FavoriteImage {
  artbot_id: string
  image_id: string
  favorited: boolean
}

export interface HordeJob {
  id?: number
  artbot_id: string // Indexed in IndexedDB
  job_id: string // Indexed in IndexedDB
  horde_id: string // Indexed in IndexedDB
  created_timestamp: number
  updated_timestamp: number
  status: JobStatus // Indexed in IndexedDB
  errors?: ImageError[] | null
  queue_position: number | null
  init_wait_time: number | null
  wait_time: number | null
  images_requested: number
  images_completed: number
  images_failed: number
  height: number
  width: number
  gen_metadata?: GenMetadata[]
}

export interface ImagesForGallery extends HordeJob {
  image_id: string
  width: number
  height: number
  image_count: number
}

export type ImageEnhancementModulesModifier = 'lora' | 'ti'

export interface ImageEnhancementModulesTable {
  model_id: string // Format: civitai_lora_[modelId] e.g., "civitai_lora_12345"
  timestamp: number
  modifier: ImageEnhancementModulesModifier
  type: 'favorite' | 'recent'
  model: Embedding
}

export type ImageErrors = 'csam' | 'notfound' | 'nsfw' | 'other'

export interface ImageError {
  type: ImageErrors
  message: string
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
  id?: number
  artbot_id: string
  hash_id: string
  timestamp: number
  favorited: number // true === 1, false === 0
  promptType: 'prompt' | 'negative' // indexed
  prompt: string
  promptWords: string[] // indexed
}

export interface PromptsJobMap {
  artbot_id: string
  prompt_id: number
}

export interface Workflow {
  type: 'qr_code' | ''
  position: WorkflowPosition
  text: string
}

export type WorkflowPosition =
  | 'center'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right'
