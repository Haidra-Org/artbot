import { db } from './dexie'

export const addFavoriteModelToDexie = async (model: string) => {
  await db.transaction('rw', db.appSettings, async () => {
    // Fetch the settings entry for 'favoriteModels'
    const favoriteModelsEntry = await db.appSettings.get('favoriteModels')

    let favoriteModels: string[] = []

    // Check if the entry exists and if the value is an array
    if (favoriteModelsEntry && Array.isArray(favoriteModelsEntry.value)) {
      favoriteModels = favoriteModelsEntry.value
    }

    // Check if the model is already in the array
    if (!favoriteModels.includes(model)) {
      favoriteModels.push(model)

      // Update the settings object in the Dexie table
      await db.appSettings.put({
        key: 'favoriteModels',
        value: favoriteModels
      })
    }
  })
}

export const getFavoriteModelsFromDexie = async (): Promise<string[]> => {
  // Fetch the settings entry for 'favoriteModels'
  const favoriteModelsEntry = await db.appSettings.get('favoriteModels')

  // Check if the entry exists and if the value is an array
  if (favoriteModelsEntry && Array.isArray(favoriteModelsEntry.value)) {
    return favoriteModelsEntry.value
  }

  // Return an empty array if there are no favorite models
  return []
}

export const removeFavoriteModelFromDexie = async (model: string) => {
  await db.transaction('rw', db.appSettings, async () => {
    // Fetch the settings entry for 'favoriteModels'
    const favoriteModelsEntry = await db.appSettings.get('favoriteModels')

    let favoriteModels: string[] = []

    // Check if the entry exists and if the value is an array
    if (favoriteModelsEntry && Array.isArray(favoriteModelsEntry.value)) {
      favoriteModels = favoriteModelsEntry.value
    }

    // Check if the model is in the array
    const modelIndex = favoriteModels.indexOf(model)
    if (modelIndex !== -1) {
      favoriteModels.splice(modelIndex, 1) // Remove the model from the array

      // Update the settings object in the Dexie table
      await db.appSettings.put({ key: 'favoriteModels', value: favoriteModels })
    }
  })
}
