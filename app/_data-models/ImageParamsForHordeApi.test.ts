import * as dbModule from '../_db/ImageFiles'
import { SourceProcessing } from '../_types/HordeTypes'
import * as imageUtils from '../_utils/imageUtils'
import { AppSettings, AppSettingsParams } from './AppSettings'
import { SavedEmbedding, SavedLora } from './Civitai'
import {
  HordeApiParams,
  ImageParamsForHordeApi
} from './ImageParamsForHordeApi'
import PromptInput from './PromptInput'

type AppSettingsKey = keyof AppSettingsParams

jest.mock('./AppSettings')
jest.mock('../_db/ImageFiles')
jest.mock('../_utils/imageUtils')
jest.mock('nanoid', () => {
  return { nanoid: () => '123' }
})

describe('ImageParamsForHordeApi', () => {
  let promptInput: PromptInput

  beforeEach(() => {
    promptInput = new PromptInput({
      // Set up a sample PromptInput with realistic values
      prompt: 'A beautiful landscape',
      negative: 'ugly, blurry',
      cfg_scale: 7,
      height: 512,
      width: 512,
      steps: 30,
      sampler: 'k_euler_a',
      seed: '123456',
      models: ['stable_diffusion']
    })

      // Mock AppSettings.get
      ; (AppSettings.get as jest.Mock).mockImplementation(
        (key: AppSettingsKey) => {
          const settings: AppSettingsParams = {
            allowedWorkers: [],
            allowNsfwImages: false,
            apiKey: 'test-api-key',
            autoDowngrade: false,
            blockedWorkers: [],
            civitAiBaseModelFilter: [],
            negativePanelOpen: false,
            runInBackground: false,
            saveInputOnCreate: false,
            sharedKey: '',
            slow_workers: true,
            useAllowedWorkers: false,
            useBeta: false,
            useBlockedWorkers: false,
            useReplacementFilter: true,
            useTrusted: true
          }

          if (key in settings) {
            return settings[key]
          }

          throw new Error(`Unexpected key: ${key}`)
        }
      )
  })

  test('setBaseParams should set correct base parameters', () => {
    const instance = new ImageParamsForHordeApi(promptInput)
    instance.setBaseParams(promptInput)

    expect(instance.apiParams).toMatchObject({
      prompt: 'A beautiful landscape ### ugly, blurry',
      params: {
        cfg_scale: 7,
        height: 512,
        width: 512,
        steps: 30,
        sampler_name: 'k_euler_a',
        seed: '123456'
      },
      nsfw: false,
      censor_nsfw: true,
      trusted_workers: true,
      models: ['stable_diffusion'],
      r2: true,
      replacement_filter: true,
      slow_workers: true
    })
  })

  test('setWorkerPreferences should set correct worker preferences', () => {
    const instance = new ImageParamsForHordeApi(promptInput)
    instance.setBaseParams(promptInput)
    instance.setWorkerPreferences()

    // Add expectations based on your AppSettings mock and logic
    expect(instance.apiParams.trusted_workers).toBe(true)
    // Add more specific assertions here
  })

  test('setEmbeddings should set correct loras and tis', () => {
    promptInput.loras = [
      new SavedLora({
        id: 'test_lora_id',
        civitAiType: 'LORA',
        versionId: 'test_version_id',
        versionName: 'Test Version',
        isArtbotManualEntry: false,
        name: 'test_lora',
        strength: 0.5,
        clip: 0.7
      })
    ]

    promptInput.tis = [
      new SavedEmbedding({
        id: 'test_ti_id',
        civitAiType: 'TextualInversion',
        versionId: 'test_ti_version_id',
        versionName: 'Test TI Version',
        isArtbotManualEntry: false,
        name: 'test_ti',
        strength: 0.6
      })
    ]

    const instance = new ImageParamsForHordeApi(promptInput)
    instance.setBaseParams(promptInput)
    instance.setEmbeddings()

    expect(instance.apiParams.params.loras).toEqual([
      { name: 'test_version_id', model: 0.5, clip: 0.7, is_version: true }
    ])

    expect(instance.apiParams.params.tis).toEqual([
      { name: 'test_ti_id', inject_ti: 'prompt', strength: 0.6 }
    ])
  })

  test('setSourceProcessing should set correct source processing parameters', async () => {
    // Mock the getImagesForArtbotJobFromDexie function
    ; (dbModule.getImagesForArtbotJobFromDexie as jest.Mock).mockResolvedValue([
      { imageBlobBuffer: new ArrayBuffer(8) }
    ])

      // Mock blobToBase64
      ; (imageUtils.blobToBase64 as jest.Mock).mockResolvedValue('base64string')

    promptInput.source_processing = SourceProcessing.Img2Img
    promptInput.denoising_strength = 0.6

    const instance = new ImageParamsForHordeApi(promptInput)
    await instance.setSourceProcessing(false)

    expect(instance.apiParams.source_processing).toBe('img2img')
    expect(instance.apiParams.source_image).toBe('base64string')
    expect(instance.apiParams.params.denoising_strength).toBe(0.6)
  })

  // Add more tests for other methods like setControlType, setWorkflows, setStylePresets, etc.

  test('build should create a complete set of API parameters', async () => {
    const { apiParams, imageDetails } =
      await ImageParamsForHordeApi.build(promptInput)

    expect(apiParams).toBeDefined()
    expect(imageDetails).toBeDefined()
    // Add more specific assertions to check if all parameters are set correctly
  })

  test('fromApiParams should correctly convert API params to PromptInput', () => {
    const apiParams: HordeApiParams = {
      prompt: 'A beautiful landscape ### ugly, blurry',
      params: {
        cfg_scale: 7,
        height: 512,
        width: 512,
        steps: 30,
        sampler_name: 'k_euler_a',
        seed: '123456',
        n: 1,
        post_processing: [],
        karras: false,
        tiling: false,
        hires_fix: false,
        clip_skip: 1
      },
      nsfw: false,
      censor_nsfw: true,
      trusted_workers: true,
      models: ['stable_diffusion'],
      r2: true,
      replacement_filter: true,
      shared: false
    }

    const result = ImageParamsForHordeApi.fromApiParams(apiParams)

    expect(result).toBeInstanceOf(PromptInput)
    expect(result.prompt).toBe('A beautiful landscape')
    expect(result.negative).toBe('ugly, blurry')
    expect(result.cfg_scale).toBe(7)
    expect(result.height).toBe(512)
    expect(result.width).toBe(512)
    expect(result.steps).toBe(30)
    expect(result.sampler).toBe('k_euler_a')
    expect(result.seed).toBe('123456')
    expect(result.models).toEqual(['stable_diffusion'])
  })
})
