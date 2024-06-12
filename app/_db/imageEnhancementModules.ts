import { ImageEnhancementModulesModifier } from '../_types/ArtbotTypes'
import { Embedding } from '../_types/CivitaiTypes'
import { db } from './dexie'

export const getFavoriteImageEnhancementModule = async (
  versionId: string,
  type: ImageEnhancementModulesModifier
) => {
  const id = `civitai_${type}_${versionId}`

  const hasFavorite = await db.imageEnhancementModules
    .where('[version_id+type]')
    .equals([id, 'favorite'])
    .toArray()

  console.log(`id`, id)

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
