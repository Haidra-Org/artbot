import PromptInput from '../_data-models/PromptInput'
import { Embedding } from './CivitaiTypes'
import { InjectTi } from './HordeTypes'

export interface AiHordeEmbedding extends Embedding {
  strength: number
  inject_ti?: InjectTi
}

// Holds various types of settings that may be used throughout the web app.
export interface AppSettingsTable {
  key: string // indexed for quick lookups
  value: unknown
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

export interface ImagesForGallery extends HordeJob {
  image_id: string
  width: number
  height: number
  image_count: number
}

export interface ImageEnhancementModulesTable {
  version_id: string // Format: civitai_lora_[versionId] e.g., "civitai_lora_12345"
  timestamp: number
  modifier: 'lora' | 'ti'
  type: 'favorite' | 'recent'
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

export interface SavedLora extends Embedding {
  id: number | string // parentID of Embedding (e.g., Embedding.id)
  versionId: number | string // id of ModelVersion,

  // Config params used for AI Horde image requests
  strength: number // AKA "model" field for AI Horde
  clip: number
}
