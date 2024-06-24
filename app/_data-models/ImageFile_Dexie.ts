import { GenMetadata } from '../_types/HordeTypes'

export enum ImageStatus {
  CENSORED = 'censored',
  ERROR = 'error',
  OK = 'ok',
  PENDING = 'pending'
}

export enum ImageType {
  IMAGE = 'image', // Default image type. e.g., response from AI Horde
  THUMB = 'thumbnail',
  CONTROLNET = 'controlnet',
  SOURCE = 'source', // Uploaded img for img2img or ControlNet
  MASK = 'mask',
  UPSCALE = 'upscale'
}

export interface ImageFileInterface {
  id?: number
  artbot_id: string
  horde_id: string
  image_id: string
  imageType?: ImageType
  imageStatus?: ImageStatus
  sampler?: string
  model?: string
  imageBlob?: Blob | null
  gen_metadata?: GenMetadata
  strength?: number | null // Used when adding multiple images (e.g., remix)
  seed?: string
  worker_id?: string
  worker_name?: string
  kudos?: number | string
  apiResponse: string
}

class ImageFile implements ImageFileInterface {
  // Indexed fields
  artbot_id: string = ''
  horde_id: string = ''
  image_id: string = ''
  imageType: ImageType = ImageType.IMAGE
  imageStatus: ImageStatus = ImageStatus.PENDING
  model: string = ''

  // Other fields
  imageBlob?: Blob | null = null
  gen_metadata?: GenMetadata
  seed: string = ''
  strength: number | null = null
  worker_id: string = ''
  worker_name: string = ''
  apiResponse: string = ''

  constructor(params: Partial<ImageFile>) {
    Object.assign(this, params)
  }
}

export { ImageFile }
