import PromptInput from '../_data-models/PromptInput';
import { db } from './dexie';
import { AppSettingsTableKeys } from '../_types/ArtbotTypes';

export const addFavoriteModelToDexie = async (model: string) => {
  await db.transaction('rw', db.appSettings, async () => {
    // Fetch the favorite models entry
    const favoriteModelsEntry = await db.appSettings
      .where({ key: 'favoriteModels' })
      .first();

    let favoriteModels: string[] = [];

    // If the entry exists and its value is an array, use it; otherwise, initialize a new array
    if (favoriteModelsEntry && Array.isArray(favoriteModelsEntry.value)) {
      favoriteModels = favoriteModelsEntry.value;
    }

    // Check if the model is already in the array
    if (!favoriteModels.includes(model)) {
      favoriteModels.push(model);

      if (favoriteModelsEntry) {
        // Update the existing entry
        await db.appSettings.update(favoriteModelsEntry.id!, {
          value: favoriteModels
        });
      } else {
        // Add a new entry
        await db.appSettings.add({
          key: 'favoriteModels',
          value: favoriteModels
        });
      }
    }
  });
};

export const getFavoriteModelsFromDexie = async (): Promise<string[]> => {
  const favoriteModelsEntry = await db.appSettings
    .where({ key: 'favoriteModels' })
    .first();

  // Check if the entry exists and if the value is an array
  if (favoriteModelsEntry && Array.isArray(favoriteModelsEntry.value)) {
    return favoriteModelsEntry.value;
  }

  // Return an empty array if there are no favorite models
  return [];
};

export const removeFavoriteModelFromDexie = async (model: string) => {
  await db.transaction('rw', db.appSettings, async () => {
    // Fetch the settings entry for 'favoriteModels'
    const favoriteModelsEntry = await db.appSettings
      .where({ key: 'favoriteModels' })
      .first();

    let favoriteModels: string[] = [];

    // Check if the entry exists and if the value is an array
    if (favoriteModelsEntry && Array.isArray(favoriteModelsEntry.value)) {
      favoriteModels = favoriteModelsEntry.value;
    }

    // Check if the model is in the array
    const modelIndex = favoriteModels.indexOf(model);
    if (modelIndex !== -1) {
      favoriteModels.splice(modelIndex, 1); // Remove the model from the array

      // Update the settings object in the Dexie table
      if (favoriteModelsEntry) {
        // Update the existing entry
        await db.appSettings.update(favoriteModelsEntry.id!, {
          value: favoriteModels
        });
      } else {
        // Create a new entry (though this case should not happen since we're removing)
        await db.appSettings.add({
          key: 'favoriteModels',
          value: favoriteModels
        });
      }
    }
  });
};

export const saveUserInputToDexie = async (input: PromptInput) => {
  await db.transaction('rw', db.appSettings, async () => {
    const userInputEntry = await db.appSettings
      .where({ key: 'userInput' })
      .first();

    if (userInputEntry && userInputEntry.id !== undefined) {
      await db.appSettings.update(userInputEntry.id, {
        value: JSON.stringify(input)
      });
    } else {
      await db.appSettings.add({
        key: 'userInput' as AppSettingsTableKeys,
        value: JSON.stringify(input)
      });
    }
  });
};

export const getUserInputFromDexie = async () => {
  const userInputEntry = await db.appSettings
    .where({ key: 'userInput' })
    .first();

  if (userInputEntry && userInputEntry.value) {
    return typeof userInputEntry.value === 'string'
      ? JSON.parse(userInputEntry.value)
      : userInputEntry.value;
  }

  return null;
};
