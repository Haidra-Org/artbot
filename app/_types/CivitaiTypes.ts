export interface ModelVersion {
  id: number | string
  modelId: number // For linking to parentId page.
  name: string
  baseModel: string
  description: string
  downloadUrl: string
  files: Array<{
    sizeKB: number
  }>
  images: Array<{
    height: number
    nsfwLevel: number
    type: string
    url: string
    width: number
  }>
  trainedWords: string[]
}

export interface Embedding {
  id: number | string
  description: string
  modelVersions: ModelVersion[]
  name: string
  nsfw: boolean
  tags: string[]
  stats: {
    downloadCount: number
    ratingCount: number
    rating: number
    thumbsUpCount: number
    thumbsDownCount: number
  }
}
