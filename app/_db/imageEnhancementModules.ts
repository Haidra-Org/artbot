import { Embedding } from '../_data-models/Civitai'
import { ImageEnhancementModulesModifier } from '../_types/ArtbotTypes'
import { db } from './dexie'

export const getFavoriteEnhancements = async (
  modifier: ImageEnhancementModulesModifier
) => {
  const favorites = await db.imageEnhancementModules
    .where('[modifier+type]')
    .equals([modifier, 'favorite'])
    .toArray()

  return favorites || []
}

export const getRecentlyUsedEnhancements = async (
  modifier: ImageEnhancementModulesModifier
) => {
  const recent = await db.imageEnhancementModules
    .where('[modifier+type]')
    .equals([modifier, 'recent'])
    .toArray()

  recent.reverse()

  return recent || []
}

export const getFavoriteImageEnhancementModule = async (
  versionId: string,
  type: ImageEnhancementModulesModifier
) => {
  const id = `civitai_${type}_${versionId}`

  const hasFavorite = await db.imageEnhancementModules
    .where('[version_id+type]')
    .equals([id, 'favorite'])
    .toArray()

  return hasFavorite
}

export const toggleImageEnhancementFavorite = async ({
  model,
  type,
  versionId
}: {
  model?: Embedding
  type: ImageEnhancementModulesModifier
  versionId: string
}) => {
  const id = `civitai_${type}_${versionId}`

  await db.transaction('rw', db.imageEnhancementModules, async () => {
    const hasFavorite = await db.imageEnhancementModules
      .where('[version_id+type]')
      .equals([id, 'favorite'])
      .toArray()

    if (hasFavorite.length > 0) {
      await db.imageEnhancementModules
        .where('[version_id+type]')
        .equals([id, 'favorite'])
        .delete()
    } else if (model) {
      await db.imageEnhancementModules.add({
        version_id: id,
        timestamp: Date.now(),
        modifier: type,
        type: 'favorite',
        model
      })
    }
  })
}

export const updateRecentlyUsedImageEnhancement = async ({
  model,
  modifier,
  versionId
}: {
  model: Embedding
  modifier: ImageEnhancementModulesModifier
  versionId: string
}) => {
  const id = `civitai_${modifier}_${versionId}`

  await db.transaction('rw', db.imageEnhancementModules, async () => {
    // Step 1: Get the most recent 20 rows
    const recentlyViewed = await db.imageEnhancementModules
      .where('[modifier+type]')
      .equals([modifier, 'recent'])
      .reverse()
      .toArray()

    // Step 2: Delete excess rows beyond the most recent 20 where type is 'recent'
    if (recentlyViewed.length > 20) {
      const excess = recentlyViewed.slice(20)
      for (const row of excess) {
        if (row.type === 'recent') {
          // Ensure we are deleting only rows with type 'recent'
          await db.imageEnhancementModules
            .where({ version_id: row.version_id })
            .delete()
        }
      }
    }

    // Step 3: Filter out/delete any row where versionId matches
    await db.imageEnhancementModules
      .where('[version_id+type]')
      .equals([id, 'recent'])
      .delete()

    // Step 4: Add the new model to the table
    await db.imageEnhancementModules.add({
      version_id: id,
      model,
      modifier,
      type: 'recent',
      timestamp: Date.now()
    })
  })
}
