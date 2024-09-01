import PromptInput, { DEFAULT_TURBO_LORA } from './PromptInput'
import { JobType } from '@/app/_types/ArtbotTypes'
import { SourceProcessing } from '@/app/_types/HordeTypes'
import { SavedLora } from './Civitai'

describe('PromptInput', () => {
  it('should initialize with default values', () => {
    const defaultPromptInput = new PromptInput()

    expect(defaultPromptInput.artbot_id).toBe('')
    expect(defaultPromptInput.cfg_scale).toBe(2)
    expect(defaultPromptInput.clipskip).toBe(1)
    expect(defaultPromptInput.control_type).toBe('')
    expect(defaultPromptInput.denoising_strength).toBe(0.75)
    expect(defaultPromptInput.dry_run).toBe(false)
    expect(defaultPromptInput.extra_texts).toBe(null)
    expect(defaultPromptInput.facefixer_strength).toBe(0.75)
    expect(defaultPromptInput.height).toBe(1024)
    expect(defaultPromptInput.hires).toBe(false)
    expect(defaultPromptInput.image_is_control).toBe(false)
    expect(defaultPromptInput.imageOrientation).toBe('square')
    expect(defaultPromptInput.imageType).toBe('')
    expect(defaultPromptInput.jobType).toBe(JobType.Text2Img)
    expect(defaultPromptInput.karras).toBe(true)
    expect(defaultPromptInput.loras.length).toEqual(1)
    expect(defaultPromptInput.models).toEqual(['AlbedoBase XL (SDXL)'])
    expect(defaultPromptInput.negative).toBe('')
    expect(defaultPromptInput.numImages).toBe(1)
    expect(defaultPromptInput.parentJobId).toBe('')
    expect(defaultPromptInput.post_processing).toEqual([])
    expect(defaultPromptInput.preset).toEqual([])
    expect(defaultPromptInput.prompt).toBe('')
    expect(defaultPromptInput.return_control_map).toBe(false)
    expect(defaultPromptInput.sampler).toBe('k_euler_a')
    expect(defaultPromptInput.seed).toBe('')
    expect(defaultPromptInput.source_processing).toBe(SourceProcessing.Prompt)
    expect(defaultPromptInput.steps).toBe(8)
    expect(defaultPromptInput.tiling).toBe(false)
    expect(defaultPromptInput.tis).toEqual([])
    expect(defaultPromptInput.triggers).toEqual([])
    expect(defaultPromptInput.upscaled).toBe(false)
    expect(defaultPromptInput.width).toBe(1024)
    expect(defaultPromptInput.workflows).toEqual([])
  })

  it('should initialize with partial values', () => {
    const partialInput = {
      cfg_scale: 7,
      height: 512,
      prompt: 'Test prompt'
    }

    const defaultPromptInput = new PromptInput(partialInput)

    expect(defaultPromptInput.cfg_scale).toBe(7)
    expect(defaultPromptInput.height).toBe(512)
    expect(defaultPromptInput.prompt).toBe('Test prompt')
    expect(defaultPromptInput.width).toBe(1024)
    expect(defaultPromptInput.jobType).toBe(JobType.Text2Img)
  })

  it('should initialize with empty object', () => {
    const defaultPromptInput = new PromptInput({})
    expect(defaultPromptInput.cfg_scale).toBe(2)
    expect(defaultPromptInput.height).toBe(1024)
    expect(defaultPromptInput.width).toBe(1024)
    expect(defaultPromptInput.jobType).toBe(JobType.Text2Img)
  })

  it('should handle array and object properties', () => {
    const partialInput = {
      extra_texts: [{ text: 'example', reference: 'ref' }]
    }

    const defaultPromptInput = new PromptInput(partialInput)

    expect(defaultPromptInput.extra_texts).toEqual([
      { text: 'example', reference: 'ref' }
    ])
  })

  it('should correctly identify a default prompt', () => {
    const defaultPromptInput = new PromptInput({})
    expect(PromptInput.isDefaultPromptInput(defaultPromptInput)).toBe(true)

    const nonDefaultPromptInput = new PromptInput({
      models: ['Different Model'],
      steps: 10,
      cfg_scale: 3
    })
    expect(PromptInput.isDefaultPromptInput(nonDefaultPromptInput)).toBe(false)
  })

  it('should correctly set non-turbo default prompt input', () => {
    const input = new PromptInput({
      loras: [DEFAULT_TURBO_LORA, { id: 'other', versionId: 'other' } as SavedLora]
    })
    const result = PromptInput.setNonTurboDefaultPromptInput(input)

    expect(result.steps).toBe(24)
    expect(result.cfg_scale).toBe(6)
    expect(result.loras).toHaveLength(1)
    expect(result.loras[0].versionId).not.toBe('247778')
  })

  it('should correctly set turbo default prompt input', () => {
    const input = new PromptInput({
      loras: [{ id: 'other', versionId: 'other' } as SavedLora]
    })
    const result = PromptInput.setTurboDefaultPromptInput(input)

    expect(result.steps).toBe(8)
    expect(result.cfg_scale).toBe(2)
    expect(result.loras).toHaveLength(2)
    expect(result.loras[0]).toEqual(DEFAULT_TURBO_LORA)
  })
})
