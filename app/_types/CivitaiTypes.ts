import { Embedding } from '../_data-models/Civitai'

export interface CivitAiApiResponse {
  items: Embedding[]
  metadata: {
    nextCursor: string
    nextPage: string
    currentPage: number
    pageSize: number
  }
}
