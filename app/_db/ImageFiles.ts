import {
  ImageFileInterface,
  ImageType
} from '@/app/_data-models/ImageFile_Dexie'
import { db } from './dexie'

export const addImageToDexie = async (image: ImageFileInterface) => {
  await db.imageFiles.add(image)
}

export const checkImageExistsInDexie = async ({
  artbot_id,
  image_id
}: {
  artbot_id?: string
  image_id?: string
}) => {
  if (artbot_id) {
    return (
      (await db.imageFiles
        .where('[artbot_id+imageType]')
        .equals([artbot_id, ImageType.IMAGE])
        .first()) || false
    )
  } else if (image_id) {
    return (await db.imageFiles.where({ image_id }).first()) || false
  }
}

export const countImagesForJobInDexie = async (artbot_id: string) => {
  return db.imageFiles.where({ artbot_id }).count()
}

export const deleteImageFileByArtbotIdTx = async (artbot_id: string) => {
  try {
    await db.transaction('rw', db.imageFiles, async () => {
      await db.imageFiles.where({ artbot_id }).delete()
    })
  } catch (error) {
    console.error('Failed to delete image file:', error)
  }
}

export const deleteImageFileByImageIdTx = async (image_id: string) => {
  try {
    await db.transaction('rw', db.imageFiles, async () => {
      await db.imageFiles.where({ image_id }).delete()
    })
  } catch (error) {
    console.error('Failed to delete image file:', error)
  }
}

export const getImageFileFromDexie = async (image_id: string) => {
  return db.imageFiles.where({ image_id }).first()
}

export const getImagesForArtbotJobFromDexie = async (
  artbot_id: string,
  imageType?: ImageType
): Promise<ImageFileInterface[]> => {
  if (imageType) {
    return db.imageFiles.where({ artbot_id, imageType }).toArray() || []
  }

  return db.imageFiles.where({ artbot_id }).toArray() || []
}

export const updateArtBotIdForImageFiles = async (
  artbot_id: string,
  new_artbot_id: string
) => {
  return await db.imageFiles
    .where({ artbot_id })
    .modify({ artbot_id: new_artbot_id })
}

export const duplicateAndModifyArtbotId = async (
  artbot_id: string,
  new_artbot_id: string
) => {
  const originalRows = await db.imageFiles.where({ artbot_id }).toArray()

  const duplicatedRows = originalRows.map((row) => {
    const newRow = { ...row, artbot_id: new_artbot_id }
    delete newRow.id
    return newRow
  })

  await db.imageFiles.bulkAdd(duplicatedRows)

  return duplicatedRows
}

export const updateImageFileFieldByImageId = async (
  image_id: string,
  fieldName: string,
  value: unknown
) => {
  try {
    // Update the specific field in the imageFiles table
    const updateCount = await db.imageFiles
      .where({ image_id })
      .modify({ [fieldName]: value })

    return updateCount // Returns the number of updated records
  } catch (error) {
    console.error('Failed to update:', error)
    throw error // Rethrow the error to handle it in the calling function
  }
}
