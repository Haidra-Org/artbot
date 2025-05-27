import { Embedding } from '../_data-models/Civitai'
import { ImageEnhancementModulesModifier } from '../_types/ArtbotTypes'
import { db } from './dexie'

export const filterEnhancements = async (
  modifier: ImageEnhancementModulesModifier,
  type: 'favorite' | 'recent',
  filterTerm: string,
  page: number = 1,
  itemsPerPage: number = 12
) => {
  const offset = (page - 1) * itemsPerPage

  const query = db.imageEnhancementModules
    .where('[modifier+type]')
    .equals([modifier, type])

  // Get all items for counting
  const allItems = await query
    .filter(
      (item) =>
        item.model.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
        item.model.description?.toLowerCase().includes(filterTerm.toLowerCase())
    )
    .toArray()

  // Sort by timestamp for recent items (newest first)
  let sortedItems = allItems
  if (type === 'recent') {
    sortedItems = allItems.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }

  // Apply pagination
  const filtered = sortedItems.slice(offset, offset + itemsPerPage)

  return {
    items: filtered,
    totalCount: allItems.length,
    currentPage: page,
    totalPages: Math.ceil(allItems.length / itemsPerPage)
  }
}

export const exportImageEnhancementModules = async () => {
  try {
    // Fetch all records from the imageEnhancementModules table
    const allModules = await db.imageEnhancementModules.toArray()

    // Convert the data to a JSON string
    const jsonData = JSON.stringify(allModules, null, 2)

    // Create a Blob with the JSON data
    const blob = new Blob([jsonData], { type: 'application/json' })

    // Create a download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'imageEnhancementModules.json'

    // Append the link to the body, click it, and remove it
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Revoke the URL to free up memory
    URL.revokeObjectURL(url)

    console.log('Image Enhancement Modules exported successfully')
  } catch (error) {
    console.error('Error exporting Image Enhancement Modules:', error)
  }
}

export const getFavoriteEnhancements = async (
  modifier: ImageEnhancementModulesModifier,
  page: number = 1,
  itemsPerPage: number = 12
) => {
  const offset = (page - 1) * itemsPerPage

  const favorites = await db.imageEnhancementModules
    .where('[modifier+type]')
    .equals([modifier, 'favorite'])
    .offset(offset)
    .limit(itemsPerPage)
    .toArray()

  const totalCount = await db.imageEnhancementModules
    .where('[modifier+type]')
    .equals([modifier, 'favorite'])
    .count()

  return {
    items: favorites || [],
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / itemsPerPage)
  }
}

export const getRecentlyUsedEnhancements = async (
  modifier: ImageEnhancementModulesModifier,
  page: number = 1,
  itemsPerPage: number = 12
) => {
  const offset = (page - 1) * itemsPerPage

  // Get all recent items and sort by timestamp
  const allRecent = await db.imageEnhancementModules
    .where('[modifier+type]')
    .equals([modifier, 'recent'])
    .toArray()

  // Sort by timestamp (newest first)
  const sortedRecent = allRecent.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

  // Apply pagination
  const recent = sortedRecent.slice(offset, offset + itemsPerPage)

  return {
    items: recent,
    totalCount: allRecent.length,
    currentPage: page,
    totalPages: Math.ceil(allRecent.length / itemsPerPage)
  }
}

export const getFavoriteImageEnhancementModule = async (
  model_id: string,
  type: ImageEnhancementModulesModifier
) => {
  const id = `civitai_${type}_${model_id}`

  const hasFavorite = await db.imageEnhancementModules
    .where('[model_id+type]')
    .equals([id, 'favorite'])
    .toArray()

  return hasFavorite
}

export const toggleImageEnhancementFavorite = async ({
  model,
  type,
  model_id
}: {
  model?: Embedding
  type: ImageEnhancementModulesModifier
  model_id: string
}) => {
  const id = `civitai_${type}_${model_id}`

  await db.transaction('rw', db.imageEnhancementModules, async () => {
    const hasFavorite = await db.imageEnhancementModules
      .where('[model_id+type]')
      .equals([id, 'favorite'])
      .toArray()

    if (hasFavorite.length > 0) {
      await db.imageEnhancementModules
        .where('[model_id+type]')
        .equals([id, 'favorite'])
        .delete()
    } else if (model) {
      await db.imageEnhancementModules.add({
        model_id: id,
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
  model_id
}: {
  model: Embedding
  modifier: ImageEnhancementModulesModifier
  model_id: string
}) => {
  const id = `civitai_${modifier}_${model_id}`

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
            .where({ version_id: row.model_id })
            .delete()
        }
      }
    }

    // Step 3: Filter out/delete any row where versionId matches
    await db.imageEnhancementModules
      .where('[model_id+type]')
      .equals([id, 'recent'])
      .delete()

    // Step 4: Add the new model to the table
    await db.imageEnhancementModules.add({
      model_id: id,
      model,
      modifier,
      type: 'recent',
      timestamp: Date.now()
    })
  })
}
