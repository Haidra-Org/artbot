import { CivitAiSearchParams, CivitAiEnhancementType } from '@/app/_types/ArtbotTypes'

/**
 * Builds a query string for CivitAI API requests with consistent cache key generation
 * @param searchParams - The search parameters including input, page, limit, and type
 * @param userBaseModelFilters - Array of user's base model filter preferences
 * @returns The formatted query string for the API request
 */
export const buildCivitaiQuery = (
  { input, page = 1, limit = 20, type }: CivitAiSearchParams,
  userBaseModelFilters: string[] = []
): string => {
  // Build base model filter based on user preferences
  let baseModelFilter = ''

  if (userBaseModelFilters.includes('SD 1.x')) {
    baseModelFilter += ['1.4', '1.5', '1.5 LCM']
      .map((e) => '&baseModels=SD ' + e)
      .join('')
  }

  if (userBaseModelFilters.includes('SD 2.x')) {
    baseModelFilter += ['2.0', '2.0 768', '2.1', '2.1 768', '2.1 Unclip']
      .map((e) => '&baseModels=SD ' + e)
      .join('')
  }

  if (userBaseModelFilters.includes('SDXL')) {
    baseModelFilter += ['0.9', '1.0', '1.0 LCM', 'Turbo']
      .map((e) => '&baseModels=SDXL ' + e)
      .join('')
  }

  if (userBaseModelFilters.includes('Pony')) {
    baseModelFilter += '&baseModels=Pony'
  }

  if (userBaseModelFilters.includes('Flux')) {
    baseModelFilter += ['Flux.1 S', 'Flux.1 D']
      .map((e) => '&baseModels=' + e)
      .join('')
  }

  if (userBaseModelFilters.includes('NoobAI')) {
    baseModelFilter += '&baseModels=NoobAI'
  }

  if (userBaseModelFilters.includes('Illustrious')) {
    baseModelFilter += '&baseModels=Illustrious'
  }

  // URL encode spaces
  baseModelFilter = baseModelFilter.replace(/ /g, '%20')

  // Determine search types based on the type parameter
  let searchTypes = 'types=LORA&types=LoCon'
  if (type === 'TextualInversion') {
    searchTypes = 'types=TextualInversion'
  } else if (type === 'LoCon') {
    searchTypes = 'types=LoCon'
  }

  // Build query components
  const query = input ? `&query=${input}` : ''
  // Don't include page parameter when there's a query search
  const paginationParam = input ? '' : `&page=${page}`
  const nsfwParam = `&nsfw=${userBaseModelFilters.includes('NSFW')}`
  
  // Construct the final search key
  const searchKey = `limit=${limit}${query}${paginationParam}${nsfwParam}${baseModelFilter}`
  const searchParams = `${searchTypes}&sort=Highest%20Rated&${searchKey}`

  // Debug logging
  console.log('[CivitAI] Building query with filters:', userBaseModelFilters)
  console.log('[CivitAI] Final query string:', searchParams)

  return searchParams
}

/**
 * Builds a cache key specifically for page 1 results
 * This is used when navigating back to the first page of results
 * @param input - The search query string
 * @param type - The type of enhancement (LORA or TextualInversion)
 * @param userBaseModelFilters - Array of user's base model filter preferences
 * @returns The cache key string for page 1
 */
export const buildPage1CacheKey = (
  input: string | undefined,
  type: CivitAiEnhancementType,
  userBaseModelFilters: string[] = []
): string => {
  return buildCivitaiQuery(
    { input, page: 1, limit: 20, type },
    userBaseModelFilters
  )
}