import { CivitAiSearchParams } from '@/app/_types/ArtbotTypes'
import CacheMap from '../../_data-models/CacheMap'
import { CivitAiApiResponse } from '../../_types/CivitaiTypes'
import { buildCivitaiQuery } from '../../_utils/civitaiCacheKey'

const SEARCH_CACHE_LIMIT = 50
const SEARCH_CACHE_EXPIRE_MINUTES = 60

const searchCache = new CacheMap({
  limit: SEARCH_CACHE_LIMIT,
  expireMinutes: SEARCH_CACHE_EXPIRE_MINUTES
})

// TODO: Figure out these questions
// do sd14 loras/tis work on sd15 models? sd0.9 stuff works with sd1.0 models...
// what about Turbo and LCM? 2.0 and 2.1? I'm just assuming 2.0 and 2.1 can be mixed, and 1.4 and 1.5 can be mixed, and lcm/turbo/not can be mixed. leave the rest to the user, maybe display that baseline somewhere.
// I dont think civitai lets you filter by model size, maybe you want to put that filter in the display code (allow 220mb loras only)
//  - except some workers have modified this. the colab worker has the limit removed, and my runpod is set to 750mb...

// Per this discussion on GitHub, this is an undocumented feature:
// https://github.com/orgs/civitai/discussions/733
// API response gives me the following valid values:
//  "'SD 1.4' | 'SD 1.5' | 'SD 1.5 LCM' | 'SD 2.0' | 'SD 2.0 768' | 'SD 2.1' | 'SD 2.1 768' | 'SD 2.1 Unclip' | 'SDXL 0.9' | 'SDXL 1.0' | 'SDXL 1.0 LCM' | 'SDXL Distilled' | 'SDXL Turbo' | 'SVD' | 'SVD XT' | 'Playground v2' | 'PixArt a' | 'Pony' | 'Other'"

const getCivitaiSearchResults = async (
  searchParams: CivitAiSearchParams,
  userBaseModelFilters: string[] = [],
  API_BASE_URL: string
): Promise<CivitAiApiResponse> => {
  let fetchUrl: string

  if (searchParams.url) {
    // Check if it's a full URL or just the query params
    if (searchParams.url.startsWith('http')) {
      fetchUrl = searchParams.url
    } else {
      // It's just the query params (cache key)
      fetchUrl = `${API_BASE_URL}/models?${searchParams.url}`
    }
  } else {
    const queryParams = buildCivitaiQuery(searchParams, userBaseModelFilters)
    fetchUrl = `${API_BASE_URL}/models?${queryParams}`
  }

  const response = await fetch(fetchUrl)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  return data
}

self.addEventListener('message', async (event: MessageEvent) => {
  const { searchParams, userBaseModelFilters, API_BASE_URL } = event.data
  
  // Use URL as cache key if provided, otherwise build from params
  const cacheKey = searchParams.url || buildCivitaiQuery(searchParams, userBaseModelFilters)

  const cachedData = searchCache.get<CivitAiApiResponse>(cacheKey)
  if (cachedData) {
    self.postMessage({ type: 'result', data: cachedData, cached: true })
    return
  }

  try {
    const result = await getCivitaiSearchResults(
      searchParams,
      userBaseModelFilters,
      API_BASE_URL
    )
    searchCache.set(cacheKey, result)
    self.postMessage({ type: 'result', data: result, cached: false })
  } catch (error: unknown) {
    console.error('[Worker] Error:', error)
    if (error instanceof Error) {
      self.postMessage({ type: 'error', error: error.message })
    } else {
      self.postMessage({ type: 'error', error: 'An unknown error occurred' })
    }
  }
})
