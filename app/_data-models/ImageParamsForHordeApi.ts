import { getImagesForArtbotJobFromDexie } from '../_db/ImageFiles'
import {
  ControlTypes,
  HordeTi,
  Lora,
  SourceProcessing
} from '../_types/HordeTypes'
import { castTiInject } from '../_utils/hordeUtils'
import { blobToBase64, bufferToBlob } from '../_utils/imageUtils'
import { formatStylePresetPrompt } from '../_utils/stringUtils'
import { AppSettings } from './AppSettings'
import { SavedLora } from './Civitai'
import { ImageBlobBuffer, ImageType } from './ImageFile_Dexie'
import PromptInput from './PromptInput'

interface HordeApiParamsBuilderInterface {
  setBaseParams(imageDetails: PromptInput): ImageParamsForHordeApi
  setWorkerPreferences(): ImageParamsForHordeApi
  setSourceProcessing(
    hideBase64String: boolean
  ): Promise<ImageParamsForHordeApi>
  setEmbeddings(): ImageParamsForHordeApi
  setControlType(): ImageParamsForHordeApi
  setStylePresets(): ImageParamsForHordeApi
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
  hires_fix_denoising_strength?: number
  clip_skip: number
  tiling: boolean
  post_processing: string[]
  n: number
  loras?: Lora[]
  tis?: HordeTi[]
  transparent?: boolean
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
      hires_fix_denoising_strength = 0.65,
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
      transparent = false,
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

    if (hires) {
      this.apiParams.params.hires_fix_denoising_strength =
        hires_fix_denoising_strength as number
    }

    if (facefixer_strength) {
      if (
        post_processing.includes('GFPGAN') ||
        post_processing.includes('CodeFormers')
      ) {
        this.apiParams.params.facefixer_strength = facefixer_strength
      }
    }

    if (transparent) {
      this.apiParams.params.transparent = true
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
    const forceWorkerId = sessionStorage.getItem('forceSelectedWorker')
    if (forceWorkerId) {
      this.apiParams.workers = [forceWorkerId]
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
          name: String(lora.versionId || lora.name),
          model: lora.strength,
          clip: lora.clip,
          is_version: lora.versionId !== false ? true : false
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

  async setSourceProcessing(
    hideBase64String: boolean
  ): Promise<ImageParamsForHordeApi> {
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
      const initImageBlob = bufferToBlob(
        initImage.imageBlobBuffer as ImageBlobBuffer
      )

      this.apiParams.source_image = hideBase64String
        ? '[ true ]'
        : await blobToBase64(initImageBlob as Blob)

      for (const image of extraImages) {
        if (image && image.imageBlobBuffer) {
          // const base64String = await blobToBase64(image.imageBlob as Blob)
          // if (idx === 0 && image.imageType === ImageType.Image) {
          //   // process the image as needed
          // }
        }
      }
    }

    const [image] = sourceImages
    const imageBlob = bufferToBlob(image.imageBlobBuffer as ImageBlobBuffer)
    const base64String = await blobToBase64(imageBlob as Blob)

    // Handle source_processing, source_image, source_mask, etc.
    if (source_processing === SourceProcessing.Img2Img) {
      this.apiParams.params.denoising_strength =
        Number(denoising_strength) || 0.75
      this.apiParams.source_image = hideBase64String ? '[ true ]' : base64String
      this.apiParams.source_processing = SourceProcessing.Img2Img

      if (sourceMask && sourceMask.length > 0) {
        const imageBlob = bufferToBlob(
          sourceMask[0].imageBlobBuffer as ImageBlobBuffer
        )
        const maskBase64String = await blobToBase64(imageBlob as Blob)
        this.apiParams.source_mask = hideBase64String
          ? '[ true ]'
          : maskBase64String
      }
    }

    if (
      source_processing === SourceProcessing.InPainting ||
      source_processing === SourceProcessing.OutPainting
    ) {
      this.apiParams.params.denoising_strength =
        Number(denoising_strength) || 0.75
      this.apiParams.source_image = hideBase64String ? '[ true ]' : base64String

      // SourceProcessing / source_processing outpainting not officially supported as of yet...
      this.apiParams.source_processing = SourceProcessing.InPainting

      if (sourceMask && sourceMask.length > 0) {
        const imageBlob = bufferToBlob(
          sourceMask[0].imageBlobBuffer as ImageBlobBuffer
        )
        const maskBase64String = await blobToBase64(imageBlob as Blob)
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

  setWorkflows(): ImageParamsForHordeApi {
    if (
      !this.imageDetails?.workflows ||
      this.imageDetails?.workflows?.length === 0
    )
      return this
    const { workflows } = this.imageDetails

    // Filter through workflows array and find element that contains type === 'qr_code`
    const qrCode = workflows.find((w) => w.type === 'qr_code')

    if (qrCode) {
      if (!this.apiParams.params.extra_texts) {
        this.apiParams.params.extra_texts = []
      }

      this.apiParams.params.workflow = 'qr_code'
      this.apiParams.params.extra_texts?.push({
        text: qrCode.text,
        reference: 'qr_code'
      })

      if (qrCode.position === 'center') {
        return this
      }

      // Default setting for Top Left
      let x_offset = 32
      let y_offset = 32

      if (qrCode.position === 'top right') {
        x_offset = this.imageDetails.width - 32
      } else if (qrCode.position === 'bottom left') {
        x_offset = 32
        y_offset = this.imageDetails.height - 32
      } else if (qrCode.position === 'bottom right') {
        x_offset = this.imageDetails.width - 32
        y_offset = this.imageDetails.height - 32
      }

      this.apiParams.params.extra_texts?.push({
        text: String(x_offset),
        reference: 'x_offset'
      })

      this.apiParams.params.extra_texts?.push({
        text: String(y_offset),
        reference: 'y_offset'
      })
    }

    return this
  }

  setStylePresets(): ImageParamsForHordeApi {
    if (this.imageDetails.preset.length === 0) return this

    this.apiParams.prompt = formatStylePresetPrompt({
      positive: this.imageDetails.prompt,
      negative: this.imageDetails.negative,
      stylePresetPrompt: this.imageDetails.preset[0].settings.prompt
    })

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

  static fromApiParams(apiParams: HordeApiParams): PromptInput {
    const promptInput = new PromptInput()

    // Extract prompt and negative prompt
    const [prompt, negative] = apiParams.prompt.split('###')
    promptInput.prompt = prompt.trim()
    promptInput.negative = negative.trim() || ''

    // Map params
    promptInput.cfg_scale = apiParams.params.cfg_scale
    promptInput.seed = apiParams.params.seed || ''
    promptInput.sampler = apiParams.params.sampler_name || 'k_dpmpp_sde'
    promptInput.height = apiParams.params.height
    promptInput.width = apiParams.params.width
    promptInput.post_processing = apiParams.params.post_processing
    promptInput.steps = apiParams.params.steps
    promptInput.tiling = apiParams.params.tiling
    promptInput.karras = apiParams.params.karras
    promptInput.hires = apiParams.params.hires_fix
    promptInput.hires_fix_denoising_strength = apiParams.params
      .hires_fix_denoising_strength as number
    promptInput.clipskip = apiParams.params.clip_skip
    promptInput.numImages = apiParams.params.n

    // Map loras
    if (apiParams.params.loras) {
      promptInput.loras = apiParams.params.loras.map(
        (lora) =>
          // @ts-expect-error Need to fix this type
          new SavedLora({
            id: lora.name,
            civitAiType: 'LORA',
            versionId: lora.name,
            isArtbotManualEntry: true,
            name: lora.name,
            strength: lora.model,
            clip: lora.clip
          })
      )
    }

    // Map other properties
    promptInput.models = apiParams.models
    promptInput.dry_run = apiParams.dry_run || false

    // Map source processing
    if (apiParams.source_processing) {
      promptInput.source_processing =
        apiParams.source_processing as SourceProcessing
      if (apiParams.params.denoising_strength) {
        promptInput.denoising_strength = apiParams.params.denoising_strength
      }
    }

    // Map control type
    if (apiParams.params.control_type) {
      promptInput.control_type = apiParams.params.control_type as ControlTypes
      promptInput.image_is_control = apiParams.params.image_is_control || false
      promptInput.return_control_map =
        apiParams.params.return_control_map || false
    }

    // Map facefixer strength
    if (apiParams.params.facefixer_strength) {
      promptInput.facefixer_strength = apiParams.params.facefixer_strength
    }

    // Map transparent
    if (apiParams.params.transparent) {
      promptInput.transparent = apiParams.params.transparent
    }

    return promptInput
  }

  static async build(
    imageDetails: PromptInput,
    options: {
      hideBase64String?: boolean
      hasError?: boolean
    } = {
      hideBase64String: false,
      hasError: false
    }
  ): Promise<{ apiParams: HordeApiParams; imageDetails: PromptInput }> {
    const instance = new ImageParamsForHordeApi(imageDetails)
    instance.setEmbeddings()
    instance.setWorkerPreferences()
    await instance.setSourceProcessing(options.hideBase64String as boolean)
    instance.setControlType()
    instance.setWorkflows()
    instance.setStylePresets()
    instance.setErrorHandling(options.hasError as boolean)
    instance.validate()

    return {
      apiParams: instance.apiParams,
      imageDetails: instance.imageDetails
    }
  }
}

export { ImageParamsForHordeApi }
