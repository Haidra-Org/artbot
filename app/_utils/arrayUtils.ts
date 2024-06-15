import { SavedLora } from '../_data-models/Civitai'

interface JsonData {
  [key: string]: string[]
}

export const mergeArrays = (jsonData: JsonData): string[] => {
  let mergedArray: string[] = []

  Object.keys(jsonData).forEach((key) => {
    mergedArray = mergedArray.concat(jsonData[key])
  })

  return mergedArray
}

export const flattenKeywords = (jsonData: SavedLora[] = []): string[] => {
  return jsonData.reduce((acc: string[], embedding: SavedLora) => {
    if (!embedding || !embedding.modelVersions) return acc

    if (embedding.modelVersions.length > 0) {
      // Flatten and concatenate the trainedWords of the first model version to the accumulator
      acc = acc.concat(embedding.modelVersions[0].trainedWords)
    }
    return acc
  }, [])
}
