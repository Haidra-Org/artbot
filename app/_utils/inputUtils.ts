import cloneDeep from 'clone-deep'
import { ImageRequest } from '../_types/ArtbotTypes'
import PromptInput from '../_data-models/PromptInput'

interface CleanInputOptions {
  artbot_id?: string
  keepSeed?: boolean
  numImages?: number
}

export const cleanImageRequestForReuse = (
  input: ImageRequest,
  options: CleanInputOptions = {}
): PromptInput => {
  const { artbot_id = '', keepSeed = true, numImages = 0 } = options

  const updatedInput = cloneDeep(input)

  // @ts-expect-error ID is added when ImageRequest is added to Dexie
  delete updatedInput.id

  if (artbot_id) {
    updatedInput.artbot_id = artbot_id
  } else {
    // @ts-expect-error New ArtBot ID will be added when creating image request.
    delete updatedInput.artbot_id
  }

  if (!keepSeed) {
    updatedInput.seed = ''
  }

  if (numImages > 0) {
    updatedInput.numImages = numImages
  }

  return updatedInput
}
