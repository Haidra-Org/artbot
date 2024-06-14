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
