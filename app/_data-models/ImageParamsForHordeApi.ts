import { getImagesForArtbotJobFromDexie } from '../_db/ImageFiles'
import {
  ControlTypes,
  Lora,
  SourceProcessing,
  TextualInversion
} from '../_types/HordeTypes'
import { castTiInject } from '../_utils/hordeUtils'
import { blobToBase64 } from '../_utils/imageUtils'
import { AppSettings } from './AppSettings'
import { SavedLora } from './Civitai'
import { ImageType } from './ImageFile_Dexie'
import PromptInput from './PromptInput'

interface HordeApiParamsBuilderInterface {
  setBaseParams(imageDetails: PromptInput): ImageParamsForHordeApi
  setWorkerPreferences(): ImageParamsForHordeApi
  setSourceProcessing(): Promise<ImageParamsForHordeApi>
  setEmbeddings(): ImageParamsForHordeApi
  setControlType(): ImageParamsForHordeApi
  setErrorHandling(hasError: boolean): ImageParamsForHordeApi
}

export interface ImageParams {
  sampler_name?: string // Optional due to ControlNet
  cfg_scale: number
  height: number
  width: number
  seed?: string
  steps: number
  denoising_strength?: number
  control_type?: string
  image_is_control?: boolean
  return_control_map?: boolean
  facefixer_strength?: number
  karras: boolean
  hires_fix: boolean
  clip_skip: number
  tiling: boolean
  post_processing: string[]
  n: number
  loras?: Lora[]
  tis?: TextualInversion[]
  workflow?: 'qr_code' | ''
  extra_texts?: Array<{
    text: string
    reference: string
  }>
}

export interface HordeApiParams {
  prompt: string
  params: ImageParams
  nsfw: boolean
  censor_nsfw: boolean
  trusted_workers: boolean
  models: Array<string>
  source_image?: string
  source_processing?: string
  source_mask?: string
  r2?: boolean
  replacement_filter?: boolean
  shared?: boolean
  workers?: Array<string>
  slow_workers?: boolean
  worker_blacklist?: boolean
  dry_run?: boolean
}

class ImageParamsForHordeApi implements HordeApiParamsBuilderInterface {
  apiParams: HordeApiParams = {} as HordeApiParams
  imageDetails: PromptInput = {} as PromptInput

  constructor(imageDetails: PromptInput) {
    this.imageDetails = imageDetails
    this.setBaseParams(imageDetails)
  }

  setBaseParams(imageDetails: PromptInput): ImageParamsForHordeApi {
    // If a user has never explicitly set "useTrusted", default to true as to prevent new users from encountering potential troll workers
    const useTrusted =
      typeof AppSettings.get('useTrusted') === 'undefined'
        ? true
        : AppSettings.get('useTrusted')

    const allowNsfw = AppSettings.get('allowNsfwImages') || false

    // explicitly check if prompt-replacement filter is disabled by user. Otherwise, set to true.
    let replacement_filter =
      AppSettings.get('useReplacementFilter') === false ? false : true

    if (replacement_filter && imageDetails.prompt.length >= 1000) {
      replacement_filter = false
    }

    const {
      cfg_scale,
      clipskip = 1,
      dry_run = false,
      facefixer_strength,
      height,
      hires = false,
      karras = false,
      models,
      negative,
      numImages = 1,
      post_processing = [],
      prompt,
      sampler,
      seed = '',
      steps,
      tiling = false,
      width
    } = imageDetails

    this.apiParams = {
      prompt: negative ? `${prompt} ### ${negative}` : prompt,
      params: {
        cfg_scale: Number(cfg_scale),
        seed: String(seed),
        sampler_name: sampler,
        height: Number(height),
        width: Number(width),
        post_processing: [...post_processing],
        steps: Number(steps),
        tiling,
        karras,
        hires_fix: hires,
        clip_skip: clipskip,
        n: numImages
      },
      nsfw: allowNsfw, // Use workers that allow NSFW images
      censor_nsfw: !allowNsfw, // Show user NSFW images if created
      trusted_workers: useTrusted,
      models,
      r2: true,
      replacement_filter,
      worker_blacklist: false,
      shared: false, // Currently disabled on the Horde API
      slow_workers: AppSettings.get('slow_workers') === false ? false : true,
      dry_run
    }

    if (facefixer_strength) {
      if (
        post_processing.includes('GFPGAN') ||
        post_processing.includes('CodeFormers')
      ) {
        this.apiParams.params.facefixer_strength = facefixer_strength
      }
    }

    // Set the base parameters of apiParams here based on imageDetails and options
    // This includes prompt, params object construction, nsfw settings, etc.
    return this
  }

  setWorkerPreferences(): ImageParamsForHordeApi {
    // Logic for worker preferences (trusted_workers, workers, worker_blacklist, etc.)
    const useAllowedWorkers = AppSettings.get('useAllowedWorkers') || false
    const useBlockedWorkers = AppSettings.get('useBlockedWorkers') || false
    const allowedWorkers = AppSettings.get('allowedWorkers') || []
    const blockedWorkers = AppSettings.get('blockedWorkers') || []

    if (useBlockedWorkers && blockedWorkers.length > 0) {
      const blocked = blockedWorkers.map(
        (worker: { value: string }) => worker.value
      )
      this.apiParams.workers = [...blocked]
      this.apiParams.worker_blacklist = true
    }

    if (!useBlockedWorkers && useAllowedWorkers && allowedWorkers.length > 0) {
      const allowed = allowedWorkers.map(
        (worker: { value: string }) => worker.value
      )
      this.apiParams.workers = [...allowed]

      // Potential ArtBot / AI Horde API interface issue.
      // If we're explicitly choosing a worker, we probably don't care, delete them.
      // Somehow, this seems to allow jobs to be processed again.
      delete this.apiParams.worker_blacklist
      delete this.apiParams.slow_workers
      delete this.apiParams.replacement_filter

      this.apiParams.trusted_workers = false

      if (!useAllowedWorkers && !useBlockedWorkers) {
        delete this.apiParams.worker_blacklist
        delete this.apiParams.workers
      }
    }

    // If user has enabled forceSelectedWorker, override any other worker preference setting.
    const worker = sessionStorage.getItem('forceSelectedWorker')
    if (worker) {
      const workerId = JSON.parse(worker).value
      this.apiParams.workers = [workerId]
      delete this.apiParams.worker_blacklist
      delete this.apiParams.slow_workers

      this.apiParams.shared = false
      this.apiParams.trusted_workers = false
    }

    return this
  }

  setEmbeddings(): ImageParamsForHordeApi {
    const { loras, tis } = this.imageDetails

    if (loras && Array.isArray(loras) && loras.length > 0) {
      this.apiParams.params.loras = loras.map((lora: SavedLora) => {
        const loraObj: Lora = {
          name: String(lora.versionId),
          model: lora.strength,
          clip: lora.clip,
          is_version: true
        }

        return loraObj
      })
    }

    if (tis && Array.isArray(tis) && tis.length > 0) {
      this.apiParams.params.tis = castTiInject(tis)
    }

    if (loras && loras.length === 0) {
      delete this.apiParams.params.loras
    }

    return this
  }

  async setSourceProcessing(): Promise<ImageParamsForHordeApi> {
    const sourceImages = await getImagesForArtbotJobFromDexie(
      this.imageDetails.artbot_id,
      ImageType.SOURCE
    )

    const sourceMask = await getImagesForArtbotJobFromDexie(
      this.imageDetails.artbot_id,
      ImageType.MASK
    )

    if (!sourceImages || sourceImages.length === 0) {
      delete this.apiParams.source_processing
      return this
    }

    const { denoising_strength, source_processing } = this.imageDetails

    if (source_processing === SourceProcessing.Remix) {
      this.apiParams.source_processing = SourceProcessing.Remix

      const [initImage, ...extraImages] = sourceImages
      this.apiParams.source_image = await blobToBase64(
        initImage.imageBlob as Blob
      )

      for (const image of extraImages) {
        if (image && image.imageBlob) {
          // const base64String = await blobToBase64(image.imageBlob as Blob)
          // if (idx === 0 && image.imageType === ImageType.Image) {
          //   // process the image as needed
          // }
        }
      }
    }

    const [image] = sourceImages
    const base64String = await blobToBase64(image.imageBlob as Blob)

    // Handle source_processing, source_image, source_mask, etc.
    if (source_processing === SourceProcessing.Img2Img) {
      this.apiParams.params.denoising_strength =
        Number(denoising_strength) || 0.75
      this.apiParams.source_image = base64String
      this.apiParams.source_processing = SourceProcessing.Img2Img

      if (sourceMask && sourceMask.length > 0) {
        const maskBase64String = await blobToBase64(
          sourceMask[0].imageBlob as Blob
        )
        this.apiParams.source_mask = maskBase64String
      }
    }

    if (
      source_processing === SourceProcessing.InPainting ||
      source_processing === SourceProcessing.OutPainting
    ) {
      this.apiParams.params.denoising_strength =
        Number(denoising_strength) || 0.75
      this.apiParams.source_image = base64String

      // SourceProcessing / source_processing outpainting not officially supported as of yet...
      this.apiParams.source_processing = SourceProcessing.InPainting

      if (sourceMask && sourceMask.length > 0) {
        const maskBase64String = await blobToBase64(
          sourceMask[0].imageBlob as Blob
        )
        this.apiParams.source_mask = maskBase64String
      }
    }

    return this
  }

  setControlType(): ImageParamsForHordeApi {
    if (!this.apiParams.source_image) {
      delete this.apiParams.source_processing
      return this
    }

    // Adjust control_type, image_is_control, and return_control_map as needed
    const { control_type, image_is_control, return_control_map } =
      this.imageDetails

    if (control_type !== ControlTypes.empty && this.apiParams.source_image) {
      this.apiParams.params.control_type = control_type
      this.apiParams.params.image_is_control = image_is_control
      this.apiParams.params.return_control_map = return_control_map
    }

    if (control_type === ControlTypes.none) {
      // Handle a very poor decision on my part
      this.apiParams.params.control_type = ''
      delete this.apiParams.params.image_is_control
      delete this.apiParams.params.return_control_map
    }

    if (control_type !== ControlTypes.empty && this.apiParams.source_image) {
      // Fields removed before sending request to API.
      delete this.apiParams.params.sampler_name
    }

    return this
  }

  setErrorHandling(hasError: boolean): ImageParamsForHordeApi {
    // Modify error handling settings if hasError is true
    if (hasError === true) {
      if (this.apiParams.source_image) {
        this.apiParams.source_image = '[true] (string removed for log output)'
      }

      if (this.apiParams.source_mask) {
        this.apiParams.source_mask = '[true] (string removed for log output)'
      }
    }

    return this
  }

  validate(): ImageParamsForHordeApi {
    if (
      this.apiParams.source_processing === SourceProcessing.Prompt ||
      this.apiParams.source_processing === SourceProcessing.None
    ) {
      console.warn(
        `Warning: Attempting to send incorrect source_processing type to AI Horde. Removing value.`
      )
      delete this.apiParams.source_processing
    }

    return this
  }

  static async build(
    imageDetails: PromptInput,
    hasError: boolean = false
  ): Promise<{ apiParams: HordeApiParams; imageDetails: PromptInput }> {
    const instance = new ImageParamsForHordeApi(imageDetails)
    instance.setWorkerPreferences()
    await instance.setSourceProcessing()
    instance.setControlType()
    instance.setErrorHandling(hasError)
    instance.validate()

    return {
      apiParams: instance.apiParams,
      imageDetails: instance.imageDetails
    }
  }
}

export { ImageParamsForHordeApi }
