// civitaiService.ts

import { CivitAiApiResponse } from '../../_types/CivitaiTypes'
import { AppSettings } from '../../_data-models/AppSettings'
import CacheMap from '../../_data-models/CacheMap'
import { Embedding } from '@/app/_data-models/Civitai'

const API_BASE_URL = 'https://civitai.com/api/v1'
const SEARCH_CACHE_LIMIT = 30
const SEARCH_CACHE_EXPIRE_MINUTES = 20
const REQUEST_TIMEOUT_MS = 8000

const searchCache = new CacheMap({
  limit: SEARCH_CACHE_LIMIT,
  expireMinutes: SEARCH_CACHE_EXPIRE_MINUTES
})

export type EnhancementType = 'LORA' | 'LoCon' | 'TextualInversion'

export interface CivitAiMetadata {
  nextCursor: string
  nextPage: string
  currentPage: number
  pageSize: number
}

interface SearchParams {
  input?: string
  page?: number
  limit?: number
  type: EnhancementType
  signal?: AbortSignal
}

const buildQuery = ({
  input,
  page = 1,
  limit = 20,
  type
}: SearchParams): string => {
  const userBaseModelFilters = AppSettings.get('civitAiBaseModelFilter')

  // TODO: Figure out these questions
  // do sd14 loras/tis work on sd15 models? sd0.9 stuff works with sd1.0 models...
  // what about Turbo and LCM? 2.0 and 2.1? I'm just assuming 2.0 and 2.1 can be mixed, and 1.4 and 1.5 can be mixed, and lcm/turbo/not can be mixed. leave the rest to the user, maybe display that baseline somewhere.
  // I dont think civitai lets you filter by model size, maybe you want to put that filter in the display code (allow 220mb loras only)
  //  - except some workers have modified this. the colab worker has the limit removed, and my runpod is set to 750mb...

  // Per this discussion on GitHub, this is an undocumented feature:
  // https://github.com/orgs/civitai/discussions/733
  // API response gives me the following valid values:
  //  "'SD 1.4' | 'SD 1.5' | 'SD 1.5 LCM' | 'SD 2.0' | 'SD 2.0 768' | 'SD 2.1' | 'SD 2.1 768' | 'SD 2.1 Unclip' | 'SDXL 0.9' | 'SDXL 1.0' | 'SDXL 1.0 LCM' | 'SDXL Distilled' | 'SDXL Turbo' | 'SVD' | 'SVD XT' | 'Playground v2' | 'PixArt a' | 'Pony' | 'Other'"
  let baseModelFilter

  baseModelFilter = userBaseModelFilters.includes('SD 1.x')
    ? ['1.4', '1.5', '1.5 LCM'].map((e) => '&baseModels=SD ' + e).join('')
    : ''
  baseModelFilter += userBaseModelFilters.includes('SD 2.x')
    ? ['2.0', '2.0 768', '2.1', '2.1 768', '2.1 Unclip']
        .map((e) => '&baseModels=SD ' + e)
        .join('')
    : ''
  baseModelFilter += userBaseModelFilters.includes('SDXL')
    ? ['0.9', '1.0', '1.0 LCM', 'Turbo']
        .map((e) => '&baseModels=SDXL ' + e)
        .join('')
    : ''
  baseModelFilter += userBaseModelFilters.includes('Pony')
    ? '&baseModels=Pony'
    : ''
  baseModelFilter = baseModelFilter.replace(/ /g, '%20')

  let searchTypes = 'types=LORA&types=LoCon'

  if (type === 'TextualInversion') {
    searchTypes = 'types=TextualInversion'
  }

  const query = input ? `&query=${input}` : ''
  const searchKey = `limit=${limit}${query}&page=${page}&nsfw=${userBaseModelFilters.includes('NSFW')}${baseModelFilter}`
  const searchParams = `${searchTypes}&sort=Highest%20Rated&${searchKey}`

  return searchParams
}

export const getCivitaiSearchResults = async ({
  input,
  page = 1,
  limit = 20,
  type = 'LORA',
  signal,
  url
}: SearchParams & { url?: string }): Promise<{
  items: Embedding[]
  metadata: CivitAiMetadata
  error?: boolean
}> => {
  try {
    let fetchUrl: string
    let cacheKey: string

    if (url) {
      fetchUrl = url
      cacheKey = url
    } else {
      const searchParams = buildQuery({ input, page, limit, type })
      fetchUrl = `${API_BASE_URL}/models?${searchParams}`
      cacheKey = searchParams
    }

    const cachedData = searchCache.get<CivitAiApiResponse>(cacheKey)
    if (cachedData) {
      return {
        items: cachedData.items || [],
        metadata: cachedData.metadata || {}
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    // Use the provided signal if available, otherwise use our internal controller's signal
    const fetchSignal = signal || controller.signal

    const response = await fetch(fetchUrl, {
      signal: fetchSignal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: CivitAiApiResponse = await response.json()
    searchCache.set(cacheKey, data)

    return {
      items: data.items || [],
      metadata: data.metadata || {}
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Request was aborted')
      return { items: [], metadata: {} as CivitAiMetadata, error: true }
    }
    console.error('CivitAi Search Error - unable to fetch results:', error)
    return { items: [], metadata: {} as CivitAiMetadata, error: true }
  }
}
