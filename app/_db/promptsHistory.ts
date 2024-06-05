import { sha256 } from 'js-sha256'
import { db } from './dexie'

function getAllWords(prompt: string) {
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

export const addPromptToDexie = async (artbot_id: string, prompt: string) => {
  const hash_id = sha256(prompt.trim().toLowerCase())
  const uniqueWords = getAllWords(prompt)

  try {
    await db.transaction(
      'rw',
      [db.promptsHistory, db.promptsJobMap],
      async () => {
        const exists = await db.promptsHistory.where({ hash_id }).first()

        if (exists && 'prompt_id' in exists) {
          await db.promptsJobMap.add({
            artbot_id,
            prompt_id: exists.prompt_id as number
          })
          return
        }

        const prompt_id = await db.promptsHistory.add({
          artbot_id,
          hash_id,
          prompt,
          promptWords: uniqueWords
        })

        if (prompt_id) {
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

        console.log(`matchingPrompts:`, matchingPrompts)

        // @ts-expect-error Oh, but "id" does exist!
        const promptIds = matchingPrompts.map((prompt) => prompt.id)

        let jobMaps
        if (sortDirection === 'desc') {
          jobMaps = await db.promptsJobMap
            .where('prompt_id')
            .anyOf(promptIds)
            .reverse()
            .toArray()
        } else if (sortDirection === 'asc') {
          jobMaps = await db.promptsJobMap
            .where('prompt_id')
            .anyOf(promptIds)
            .toArray()
        }

        if (!jobMaps) {
          return []
        }

        // In theory, there should not be multiple artbot_ids associated with multiple prompts.
        // So we can skip any check for duplicate jobs here.
        const artbotIds = jobMaps.map((entry) => entry.artbot_id)
        console.log(`artbotIds`, artbotIds)
        const artbotIdsFlat = artbotIds.flat()

        // Flatten the array of artbot_id arrays and remove duplicates
        const uniqueArtbotIds = artbotIdsFlat.slice(offset, offset + limit)

        console.log(`uniqueArtbotIds`, uniqueArtbotIds)

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
