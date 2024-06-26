import { sha256 } from 'js-sha256'
import { db } from './dexie'
import { PromptsHistory } from '../_types/ArtbotTypes'

export const getAllWords = (prompt: string = '') => {
  if (!prompt.trim()) return []

  prompt = prompt.trim()

  // Split the text into words, removing punctuation and splitting on any amount of whitespace
  const allWords = prompt.split(/\W+/).filter(Boolean)

  // Filter out words that are 2 characters or less, then map each word to lowercase
  const filteredWords = allWords
    .filter((word) => word.length > 2)
    .map((word) => word.toLowerCase())

  // Use a Set to store the filtered, lowercase words to ensure uniqueness
  const wordSet = new Set(filteredWords)

  // Convert the Set back into an array and return it
  return Array.from(wordSet)
}

export const updateFavoritePrompt = async (id: number, status: boolean) => {
  try {
    await db.transaction('rw', db.promptsHistory, async () => {
      await db.promptsHistory
        .where('id')
        .equals(id)
        .modify({ favorited: status ? 1 : 0 })
    })
  } catch (error) {
    console.error('Transaction failed: ', error)
    throw error
  }
}

export const getPromptHistoryCountFromDexie = async (
  promptType: 'prompt' | 'negative' = 'prompt',
  showFavorites: boolean = false
): Promise<number> => {
  if (showFavorites) {
    const query: [string, number] = [promptType, showFavorites ? 1 : 0]
    return await db.promptsHistory
      .where('[promptType+favorited]')
      .equals(query)
      .count()
  }

  return await db.promptsHistory.where({ promptType }).count()
}

/**
 * Get prompts that contain all elements in the input array within the promptWords field,
 * supporting pagination and filtering by promptType.
 *
 * @param {string[]} input - Array of words to match against the promptWords field.
 * @param {number} offset - Number of items to skip for pagination.
 * @param {number} limit - Number of items to return for pagination.
 * @param {'prompt' | 'negative'} promptType - Type of prompt to filter.
 * @returns {Promise<PromptsHistory[]>} - Array of matching prompt rows.
 */
export const getPromptsByWordsWithPagination = async (
  input: string[],
  offset: number = 0,
  limit: number = 20,
  promptType: 'prompt' | 'negative' = 'prompt',
  count = false
): Promise<PromptsHistory[] | number> => {
  // Ensure input array is not empty
  if (input.length === 0) return []

  // Get results for the first word to start
  let results = await db.promptsHistory
    .where('promptWords')
    .equals(input[0])
    .filter((prompt) => prompt.promptType === promptType) // Filter by promptType initially
    .toArray()

  // Intersect results for each subsequent word
  for (let i = 1; i < input.length; i++) {
    const wordResults = await db.promptsHistory
      .where('promptWords')
      .equals(input[i])
      .filter((prompt) => prompt.promptType === promptType) // Filter by promptType at each step
      .toArray()

    // Intersect current results with new results
    results = results.filter((item) =>
      wordResults.some((wr) => wr.id === item.id)
    )
  }

  if (count) return results.length

  // Apply pagination: slice results according to offset and limit
  const paginatedResults = results.slice(offset, offset + limit)

  return paginatedResults
}

/**
 * Get prompt history with optional filtering by prompt type, pagination, and favorites.
 *
 * @param {object} params - Object containing parameters for the query.
 * @param {number} params.offset - Number of items to skip for pagination.
 * @param {number} params.limit - Number of items to return for pagination.
 * @param {'prompt' | 'negative'} params.promptType - Type of prompt to filter.
 * @param {boolean} [params.showFavorites] - Optional flag to show only favorited prompts.
 * @returns {Promise<PromptsHistory[]>} - Array of prompt history records.
 */
export const getPromptHistoryFromDexie = async ({
  offset = 0,
  limit = 20,
  promptType = 'prompt',
  showFavorites = false
}: {
  offset?: number
  limit?: number
  promptType?: 'prompt' | 'negative'
  showFavorites?: boolean
} = {}): Promise<PromptsHistory[]> => {
  // If showFavorites is true, filter by favorited prompts with the specified prompt type
  if (showFavorites) {
    return await db.promptsHistory
      .where('[promptType+favorited]')
      .equals([promptType, 1])
      .offset(offset)
      .limit(limit)
      .reverse()
      .toArray()
  }

  // Otherwise, filter by promptType only
  return await db.promptsHistory
    .where({ promptType })
    .offset(offset)
    .limit(limit)
    .reverse()
    .toArray()
}

export const addPromptToDexie = async ({
  artbot_id = '',
  prompt = '',
  promptType = 'prompt'
}: {
  prompt: string
  artbot_id?: string
  promptType?: 'prompt' | 'negative'
}) => {
  if (prompt.trim().length === 0) return
  const hash_id = sha256(prompt.trim().toLowerCase())
  const uniqueWords = getAllWords(prompt)

  try {
    await db.transaction(
      'rw',
      [db.promptsHistory, db.promptsJobMap],
      async () => {
        const exists = await db.promptsHistory.where({ hash_id }).first()

        if (exists && 'id' in exists) {
          await db.promptsJobMap.add({
            artbot_id,
            prompt_id: exists.id as number
          })
          await db.promptsHistory
            .where({ id: exists.id })
            .modify({ timestamp: Date.now() })
          return
        }

        const prompt_id = await db.promptsHistory.add({
          artbot_id,
          hash_id,
          timestamp: Date.now(),
          favorited: 0,
          prompt,
          promptWords: uniqueWords,
          promptType
        })

        if (prompt_id && promptType === 'prompt') {
          await db.promptsJobMap.add({
            artbot_id,
            prompt_id
          })
        }
      }
    )
  } catch (err) {
    console.log('addPromptToDexie error: ', err)
    throw err
  }
}

export const searchPromptsFromDexie = async ({
  limit = 20,
  offset = 0,
  searchInput,
  sortDirection = 'desc'
}: {
  limit?: number
  offset?: number
  searchInput: string
  sortDirection?: 'asc' | 'desc'
}) => {
  const searchTerms = searchInput.toLowerCase().split(/\W+/).filter(Boolean)

  try {
    return await db.transaction(
      'r',
      [db.promptsHistory, db.promptsJobMap, db.imageFiles, db.imageRequests],
      async () => {
        // Step 1: Find matching prompts and derive corresponding artbot_ids
        const promptsQuery = db.promptsHistory
          .where('promptWords')
          .startsWithAnyOf(searchTerms)

        let matchingPrompts
        if (sortDirection === 'desc') {
          matchingPrompts = await promptsQuery
            .limit(limit)
            .reverse()
            .sortBy('id')
        } else {
          matchingPrompts = await promptsQuery.limit(limit).sortBy('id')
        }

        const promptIds = matchingPrompts.map((prompt) => prompt.id)

        let jobMaps
        if (sortDirection === 'desc') {
          jobMaps = await db.promptsJobMap
            .where('id')
            .anyOf(promptIds as number[])
            .reverse()
            .toArray()
        } else if (sortDirection === 'asc') {
          jobMaps = await db.promptsJobMap
            .where('id')
            .anyOf(promptIds as number[])
            .toArray()
        }

        if (!jobMaps) {
          return []
        }

        // In theory, there should not be multiple artbot_ids associated with multiple prompts.
        // So we can skip any check for duplicate jobs here.
        const artbotIds = jobMaps.map((entry) => entry.artbot_id)
        const artbotIdsFlat = artbotIds.flat()

        // Flatten the array of artbot_id arrays and remove duplicates
        const uniqueArtbotIds = artbotIdsFlat.slice(offset, offset + limit)

        // Step 2: Fetch image data for the filtered artbot_ids
        const imageData = await Promise.all(
          uniqueArtbotIds.map(async (artbot_id) => {
            const totalImages = await db.imageFiles
              .where('artbot_id')
              .equals(artbot_id)
              .count()

            const imageFile = await db.imageFiles
              .where('artbot_id')
              .equals(artbot_id)
              .first()

            // Optionally, add additional data from imageRequests if needed
            const imageRequest = await db.imageRequests
              .where('artbot_id')
              .equals(artbot_id)
              .first()

            // This block is probably useful for when I split up image requests to show *every* image.
            // return imageDetails.map((imageFile) => ({
            //   artbot_id: imageFile.artbot_id,
            //   image_id: imageFile.image_id,
            //   height: imageRequest?.height,
            //   width: imageRequest?.width,
            //   image_count: imageDetails.length
            // }))

            console.log({
              artbot_id: imageFile?.artbot_id,
              image_id: imageFile?.image_id,
              height: imageRequest?.height,
              width: imageRequest?.width,
              image_count: totalImages
            })

            return {
              artbot_id: imageFile?.artbot_id,
              image_id: imageFile?.image_id,
              height: imageRequest?.height,
              width: imageRequest?.width,
              image_count: totalImages
            }
          })
        )

        return imageData.flat() // Flatten the array if each map returns an array
      }
    )
  } catch (err) {
    console.error('Error searching prompts:', err)
    throw err
  }
}

export const deletePromptFromDexie = async (id: number) => {
  await db.transaction(
    'rw',
    [db.promptsHistory, db.promptsJobMap],
    async () => {
      await db.promptsJobMap.where('prompt_id').equals(id).delete()
      await db.promptsHistory.delete(id)
    }
  )
}
