import { ImageRequest } from '../_types/ArtbotTypes'
import { db } from './dexie'

export const addImageRequestToDexie = async (imageRequest: ImageRequest) => {
  return await db.imageRequests.add(imageRequest)
}

export const getImageRequestsFromDexieById = async (artbotIds: string[]) => {
  let files = await db.imageRequests
    .where('artbot_id')
    .anyOf(artbotIds)
    .toArray()

  // @ts-expect-error id is returned from Dexie
  files = files.sort((a, b) => a.id - b.id)

  return files
}
