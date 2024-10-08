import cloneDeep from 'clone-deep'
import { nanoid } from 'nanoid'

import { db } from './dexie'
import { getImageFileFromDexie } from './ImageFiles'
import PromptInput from '../_data-models/PromptInput'
import { JobStatus } from '../_types/ArtbotTypes'
import { ImageFileInterface, ImageType } from '../_data-models/ImageFile_Dexie'
import { AppConstants } from '../_data-models/AppConstants'
import { ArtBotHordeJob } from '../_data-models/ArtBotHordeJob'

export const addImageAndDefaultFavToDexie = async (
  image: ImageFileInterface
) => {
  return await db.transaction('rw', [db.imageFiles, db.favorites], async () => {
    await db.imageFiles.add(image)
    await db.favorites.add({
      artbot_id: image.artbot_id,
      image_id: image.image_id,
      favorited: false
    })
  })
}

interface AddPendingJobToDexieOptions {
  horde_id?: string
  status?: JobStatus
}

export const addPendingJobToDexie = async (
  input: PromptInput,
  options = {} as AddPendingJobToDexieOptions
) => {
  const { horde_id, status } = options
  const updatedInput = cloneDeep(input)

  // No idea where the eff "id" is being added before it gets here.
  // @ts-expect-error id is somehow added here and messes with adding to Dexie
  delete updatedInput.id

  // @ts-expect-error remove any instance of "artbot_id" since we always want to create a new ID
  delete updatedInput.artbot_id
  updatedInput.artbot_id = nanoid(AppConstants.NANO_ID_LENGTH)

  const job = new ArtBotHordeJob({
    artbot_id: updatedInput.artbot_id,
    job_id: nanoid(AppConstants.NANO_ID_LENGTH),
    horde_id: horde_id || '',
    created_timestamp: Date.now(),
    horde_completed_timestamp: 0,
    horde_received_timestamp: 0,
    updated_timestamp: Date.now(),
    status: status || JobStatus.Waiting,
    queue_position: null,
    init_wait_time: null,
    wait_time: null,
    images_requested: updatedInput.numImages,
    images_completed: 0,
    images_failed: 0,
    height: updatedInput.height,
    width: updatedInput.width
  })

  await db.transaction('rw', [db.imageRequests, db.hordeJobs], async () => {
    await db.hordeJobs.add(job)
    await db.imageRequests.add(updatedInput)
  })

  return job
}

export const deleteImageFromDexie = async (image_id: string) => {
  return db.transaction('rw', [db.imageFiles, db.favorites, db.hordeJobs, db.imageRequests, db.promptsJobMap], async () => {
    let artbot_id
    const image = await getImageFileFromDexie(image_id)

    if (image && 'artbot_id' in image) {
      artbot_id = image.artbot_id
      const images = await db.imageFiles.where({ artbot_id }).toArray()

      if (!images || images.length === 0 || (images && images.length === 1 && images[0].image_id === image_id)) {
        await deleteJobFromDexie(artbot_id)
        return { deletedJob: true, success: true }
      }
    }

    await db.favorites.where({ image_id }).delete()
    await db.imageFiles.where({ image_id }).delete()

    return {
      deletedImage: true,
      success: true
    }
  })
}

export const deleteJobFromDexie = async (artbot_id: string) => {
  if (!artbot_id) return

  await db.transaction(
    'rw',
    [db.favorites, db.hordeJobs, db.imageFiles, db.imageRequests, db.promptsJobMap],
    async () => {
      await db.favorites.where({ artbot_id }).delete()
      await db.hordeJobs.where({ artbot_id }).delete()
      await db.imageFiles.where({ artbot_id }).delete()
      await db.imageRequests.where({ artbot_id }).delete()
      await db.promptsJobMap.where({ artbot_id }).delete()
    }
  )
}

export const getImagesForJobFromDexie = async (artbot_id: string) => {
  const data = await db.transaction(
    'r',
    [db.imageFiles, db.imageRequests, db.hordeJobs],
    async () => {
      const jobDetails = await db.hordeJobs.where({ artbot_id }).first()

      if (!jobDetails) return

      const imageFiles = await await db.imageFiles
        .where('[artbot_id+imageType]')
        .equals([artbot_id, ImageType.IMAGE])
        .toArray()
      const imageRequest = await db.imageRequests.where({ artbot_id }).first()

      return {
        jobDetails,
        imageFiles,
        imageRequest
      }
    }
  )

  return data
}

export const getImageDetailsFromDexie = async (
  image_id: string,
  imageType: ImageType = ImageType.IMAGE
) => {
  const data = await db.transaction(
    'r',
    [db.imageFiles, db.imageRequests, db.hordeJobs],
    async () => {
      const imageFile = await await db.imageFiles
        .where({ image_id, imageType })
        .first()

      if (!imageFile || !imageFile.artbot_id) return

      const { artbot_id } = imageFile

      const jobDetails = await db.hordeJobs.where({ artbot_id }).first()
      const imageRequest = await db.imageRequests.where({ artbot_id }).first()
      return {
        jobDetails,
        imageFile,
        imageRequest
      }
    }
  )

  return data
}
