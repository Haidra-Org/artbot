import { db } from './dexie'

export const updateFavoriteInDexie = async (
  artbot_id: string,
  image_id: string,
  favorited: boolean
) => {
  try {
    await db.transaction('rw', db.favorites, async () => {
      const status = (await getFavoriteFromDexie(image_id)) || {}

      if ('favorited' in status) {
        await db.favorites.where({ image_id }).modify({ favorited })
      } else {
        await db.favorites.add({ artbot_id, image_id, favorited })
      }
    })
  } catch (error) {
    console.error('Transaction failed: ', error)
    throw error
  }
}

export const deleteFavoriteFromDexie = async (image_id: string) => {
  try {
    await db.transaction('rw', db.favorites, async () => {
      await db.favorites.where({ image_id }).delete()
    })
  } catch (error) {
    console.error('Transaction failed: ', error)
    throw error // Rethrow the error to be handled by the caller
  }
}

export const getFavoriteFromDexie = async (image_id: string) => {
  if (!image_id) return {}

  return await db.favorites.where({ image_id }).first()
}
