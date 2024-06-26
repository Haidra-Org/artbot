// Define the type for the ModelVersion constructor parameters
interface ModelVersionParams {
  id: number | string
  modelId: number
  name: string
  baseModel: string
  description: string
  downloadUrl: string
  files: Array<{ sizeKB: number }>
  images: Array<{
    height: number
    nsfwLevel: number
    type: string
    url: string
    width: number
  }>
  trainedWords: string[]
}

export class ModelVersion {
  id: number | string
  modelId: number
  name: string
  baseModel: string
  description: string
  downloadUrl: string
  files: Array<{ sizeKB: number }>
  images: Array<{
    height: number
    nsfwLevel: number
    type: string
    url: string
    width: number
  }>
  trainedWords: string[]

  constructor(params: ModelVersionParams) {
    this.id = params.id
    this.modelId = params.modelId
    this.name = params.name
    this.baseModel = params.baseModel
    this.description = params.description
    this.downloadUrl = params.downloadUrl
    this.files = params.files
    this.images = params.images
    this.trainedWords = params.trainedWords || []
  }
}

// Define the type for the Embedding constructor parameters
interface EmbeddingParams {
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

// Define the Embedding class
export class Embedding {
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

  constructor(params: EmbeddingParams) {
    this.id = params.id
    this.description = params.description
    this.modelVersions = params.modelVersions || []
    this.name = params.name
    this.nsfw = params.nsfw
    this.tags = params.tags
    this.stats = params.stats
  }
}

// Define the type for the SaveLora constructor parameters, extending EmbeddingParams
interface SavedLoraParams extends Partial<EmbeddingParams> {
  id: number | string // parentID of Embedding (e.g., Embedding.id)
  versionId: number | string | boolean // id of ModelVersion,
  versionName: string
  isArtbotManualEntry?: boolean

  // Config params used for AI Horde image requests
  strength: number // AKA "model" field for AI Horde
  clip: number
}

// Define the SaveLora class extending from Embedding
export class SavedLora extends Embedding {
  versionId: number | string | boolean // bool is Artbot specific to disable Horde is_version flag.
  versionName: string
  isArtbotManualEntry: boolean
  strength: number
  clip: number

  constructor(params: SavedLoraParams) {
    super({
      id: params.id ?? '',
      description: params.description ?? '',
      modelVersions: params.modelVersions ?? [],
      name: params.name ?? '',
      nsfw: params.nsfw ?? false,
      tags: params.tags ?? [],
      stats: params.stats ?? {
        downloadCount: 0,
        ratingCount: 0,
        rating: 0,
        thumbsUpCount: 0,
        thumbsDownCount: 0
      }
    })
    this.versionId = params.versionId
    this.versionName = params.versionName
    this.isArtbotManualEntry = params.isArtbotManualEntry || false
    this.strength = params.strength
    this.clip = params.clip
  }

  // Additional methods can be added here
  getModelVersionById(versionId: number | string): ModelVersion | undefined {
    return this.modelVersions.find((version) => version.id === versionId)
  }

  // Example method to display information
  displayInfo() {
    console.log(`SaveLora - Name: ${this.name}, Version ID: ${this.versionId}`)
  }
}
