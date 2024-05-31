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

export enum InjectTi {
  Prompt = 'prompt',
  NegPrompt = 'negprompt'
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
