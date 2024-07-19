export interface AvailableImageModel {
  count: number
  eta: number
  jobs: number
  name: string
  performance: number
  queued: number
  type: string
}

export interface CategoryPreset {
  [key: string]: string[]
}

export enum ControlTypes {
  // ArtBot specific
  // Delete before sending to API.
  empty = '', // ArtBot specific enum
  none = 'none', // ArtBot specific enum

  // Officially supported AI Horde ControlTypes
  canny = 'canny',
  hed = 'hed',
  depth = 'depth',
  normal = 'normal',
  openpose = 'openpose',
  seg = 'seg',
  scribble = 'scribble',
  fakescribbles = 'fakescribbles',
  hough = 'hough'
}

export interface GenMetadata {
  type: string
  value: string
  ref?: string
}

export interface HordeGeneration {
  img: string
  seed: string
  id: string
  censored: boolean
  gen_metadata: GenMetadata[]
  worker_id: string
  worker_name: string
  model: string
  state: string
}

export interface HordeJobResponse {
  done: boolean
  faulted: boolean
  finished: number
  generations?: HordeGeneration[]
  is_possible: boolean
  kudos: number
  processing: number
  queue_position: number | null // null if not yet available (ArtBot)
  restarted: number
  shared?: boolean
  wait_time: number | null // null if not yet available (ArtBot)
  waiting: number
}

export interface HordePerformance {
  queued_requests: number
  queued_text_requests: number
  worker_count: number
  text_worker_count: number
  thread_count: number
  text_thread_count: number
  queued_megapixelsteps: number
  past_minute_megapixelsteps: number
  queued_forms: number
  interrogator_count: number
  interrogator_thread_count: number
  queued_tokens: number
  past_minute_tokens: number
}

export interface HordeTi {
  name: string
  inject_ti?: InjectTi
  strength: number
}

export interface HordeUser {
  username: string
  id: number
  kudos: number
  concurrency: number
  worker_invited: number
  moderator: boolean
  kudos_details: {
    accumulated: number
    gifted: number
    donated: number
    admin: number
    received: number
    recurring: number
    awarded: number
  }
  worker_count: number
  worker_ids: string[]
  sharedkey_ids: string[]
  trusted: boolean
  flagged: boolean
  vpn: boolean
  service: boolean
  education: boolean
  special: boolean
  pseudonymous: boolean
  account_age: number
  usage: {
    megapixelsteps: number | null
    requests: number | null
  }
  contributions: {
    megapixelsteps: number | null
    fulfillments: number | null
  }
  records: {
    usage: {
      megapixelsteps: number
      tokens: number
    }
    contribution: {
      megapixelsteps: number
      tokens: number
    }
    fulfillment: {
      image: number
      text: number
      interrogation: number
    }
    request: {
      image: number
      text: number
      interrogation: number
    }
  }
}

export interface HordeWorker {
  id: string
  info: string
  bridge_agent: string
  kudos_details: { generated: number; uptime: number }
  kudos_rewards: number
  loading?: boolean
  lora: boolean
  img2img: boolean
  maintenance_mode: boolean
  max_pixels: number
  models: string[]
  name: string
  nsfw: boolean
  online: boolean
  painting: boolean
  performance: string
  'post-processing': boolean
  requests_fulfilled: number
  team: {
    id: string | null
    name: string | null
  }
  threads: number
  trusted: boolean
  uptime: number
}

export interface ImageModelDetails {
  name: string
  baseline: string
  type: string
  inpainting: boolean
  description: string
  showcases: string[]
  version: string
  style: string
  nsfw: boolean
  homepage: string
  download_all: boolean
  config: {
    files: {
      path: string
      md5sum?: string
      sha256sum?: string
    }[]
    download: {
      file_name: string
      file_path: string
      file_url: string
    }[]
  }
  available: boolean
  size_on_disk_bytes: number
}

export type InjectTi = 'prompt' | 'negprompt' | 'none'

export interface Lora {
  /** "label" is specifically added by ArtBot in order to store a
   * "nice" name to display on the front-end, or with shared image
   * settings. It should be stripped out when passing an image
   * request to the Horde API.
   */
  label?: string
  name: string
  model: number // AKA "strength"
  clip: number
  is_version?: boolean
}

export enum SourceProcessing {
  // ArtBot specific
  // Delete before sending to API.
  None = 'none', // ArtBot specific type. Do not send to Horde
  Prompt = 'prompt', // ArtBot specific type. Do not send to Horde.

  // Officially supported AI Horde SourceProcessing types
  Img2Img = 'img2img',
  InPainting = 'inpainting',
  OutPainting = 'outpainting',
  Remix = 'remix'
}

export interface TextualInversion {
  name: string
  inject_ti?: string
  strength?: number
}

export interface LoraConfig {
  name: string
  model?: number
  clip_skip?: number
  is_version: boolean
}

export interface StylePresetConfig {
  prompt: string
  model: string
  enhance?: boolean
  steps?: number
  width?: number
  height?: number
  sampler_name?: string
  karras?: boolean
  cfg_scale?: number
  hires_fix?: boolean
  loras?: LoraConfig[]
}

export interface StylePresetConfigurations {
  [key: string]: StylePresetConfig
}

export interface StylePreview {
  person: string
  place: string
  thing: string
}

export interface StylePreviewConfigurations {
  [key: string]: StylePreview
}
