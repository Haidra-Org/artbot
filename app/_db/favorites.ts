import { db } from './dexie'

export const updateFavoriteInDexie = async (
  artbot_id: string,
  image_id: string,
  favorited: boolean
) => {
  const status = (await getFavoriteFromDexie(image_id)) || {}

  if ('favorited' in status) {
    await db.favorites.where({ image_id }).modify({ favorited })
    return
  }

  await db.favorites.add({ artbot_id, image_id, favorited })
}

export const deleteFavoriteFromDexie = async (image_id: string) => {
  await db.favorites.where({ image_id }).delete()
}

export const getFavoriteFromDexie = async (image_id: string) => {
  if (!image_id) return {}

  return await db.favorites.where({ image_id }).first()
}
