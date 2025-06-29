import { CivitAiSearchParams } from '@/app/_types/ArtbotTypes'
import CacheMap from '../../_data-models/CacheMap'
import { CivitAiApiResponse } from '../../_types/CivitaiTypes'

const SEARCH_CACHE_LIMIT = 30
const SEARCH_CACHE_EXPIRE_MINUTES = 20

const searchCache = new CacheMap({
  limit: SEARCH_CACHE_LIMIT,
  expireMinutes: SEARCH_CACHE_EXPIRE_MINUTES
})

const buildQuery = (
  { input, page = 1, limit = 20, type }: CivitAiSearchParams,
  userBaseModelFilters: string[] = []
): string => {
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
    ? ['1.4', '1.5', '1.5 LCM'].map((e) => '&baseModel=SD ' + e).join('')
    : ''
  baseModelFilter += userBaseModelFilters.includes('SD 2.x')
    ? ['2.0', '2.0 768', '2.1', '2.1 768', '2.1 Unclip']
        .map((e) => '&baseModel=SD ' + e)
        .join('')
    : ''
  baseModelFilter += userBaseModelFilters.includes('SDXL')
    ? ['0.9', '1.0', '1.0 LCM', 'Turbo']
        .map((e) => '&baseModel=SDXL ' + e)
        .join('')
    : ''
  baseModelFilter += userBaseModelFilters.includes('Pony')
    ? '&baseModel=Pony'
    : ''
  baseModelFilter += userBaseModelFilters.includes('Flux')
    ? ['Flux.1 S', 'Flux.1 D']
        .map((e) => '&baseModel=' + e)
        .join('')
    : ''
  baseModelFilter += userBaseModelFilters.includes('NoobAI')
    ? '&baseModel=NoobAI'
    : ''
  baseModelFilter += userBaseModelFilters.includes('Illustrious')
    ? '&baseModel=Illustrious'
    : ''
  baseModelFilter = baseModelFilter.replace(/ /g, '%20')

  let searchTypes = 'types=LORA&types=LoCon'

  if (type === 'TextualInversion') {
    searchTypes = 'types=TextualInversion'
  }

  const query = input ? `&query=${input}` : ''
  // Don't include page parameter when there's a query search
  const paginationParam = input ? '' : `&page=${page}`
  const searchKey = `limit=${limit}${query}${paginationParam}&nsfw=${userBaseModelFilters.includes('NSFW')}${baseModelFilter}`
  const searchParams = `${searchTypes}&sort=Highest%20Rated&${searchKey}`

  return searchParams
}

const getCivitaiSearchResults = async (
  searchParams: CivitAiSearchParams,
  userBaseModelFilters: string[] = [],
  API_BASE_URL: string
): Promise<CivitAiApiResponse> => {
  let fetchUrl: string

  if (searchParams.url) {
    fetchUrl = searchParams.url
  } else {
    const queryParams = buildQuery(searchParams, userBaseModelFilters)
    fetchUrl = `${API_BASE_URL}/models?${queryParams}`
  }

  const response = await fetch(fetchUrl)

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

self.addEventListener('message', async (event: MessageEvent) => {
  const { searchParams, userBaseModelFilters, API_BASE_URL } = event.data
  const cacheKey = buildQuery(searchParams, userBaseModelFilters)

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
    if (error instanceof Error) {
      self.postMessage({ type: 'error', error: error.message })
    } else {
      self.postMessage({ type: 'error', error: 'An unknown error occurred' })
    }
  }
})
