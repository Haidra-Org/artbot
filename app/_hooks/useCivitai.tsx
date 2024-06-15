// CivitAi API reference: https://github.com/civitai/civitai/wiki/REST-API-Reference

import { useCallback, useEffect, useState } from 'react'
import { AppSettings } from '../_data-models/AppSettings'
import { debounce } from '../_utils/debounce'
import CacheMap from '../_data-models/CacheMap'
import { CivitAiApiResponse } from '../_types/CivitaiTypes'
import {
  getFavoriteEnhancements,
  getRecentlyUsedEnhancements
} from '../_db/imageEnhancementModules'
import LORAS from '../_components/AdvancedOptions/LoRAs/_LORAs.json'
import { Embedding } from '../_data-models/Civitai'

const searchCache = new CacheMap({ limit: 30, expireMinutes: 20 })

// Hacky implementation of a throttled search.
let pendingRequest = false
const getCivitaiSearchResults = async ({
  input,
  page = 1,
  limit = 20,
  type = 'LORA'
}: {
  input?: string
  page?: number
  limit?: number
  type?: 'LoCon' | 'LORA' | 'TextualInversion'
}) => {
  try {
    if (pendingRequest) return false

    pendingRequest = true

    const userBaseModelFilters = AppSettings.get('civitAiBaseModelFilter')

    // Use AbortController to timeout long responses from CivitAI
    const controller = new AbortController()
    const signal = controller.signal

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

    if (searchCache.get(searchKey)) {
      const data = searchCache.get<CivitAiApiResponse>(searchKey)
      if (data) {
        const { items = [], metadata = {} } = data
        pendingRequest = false
        return { items, metadata }
      }
    }

    const timeout = setTimeout(() => {
      controller.abort()
      pendingRequest = false
      console.error('CivitAi Search Error - Request timed out.')
    }, 5000)

    const searchParams = `${searchTypes}&sort=Highest%20Rated&${searchKey}`

    const response = await fetch(
      `https://civitai.com/api/v1/models?${searchParams}`,
      { signal }
    )
    clearTimeout(timeout)

    const data = await response.json()
    searchCache.set(searchParams, data)

    const { items = [], metadata = {} } = data
    pendingRequest = false
    return { items, metadata }
  } catch (error) {
    console.error('CivitAi Search Error - unable to fetch results:', error)
    pendingRequest = false
    return { items: [], metadata: {}, error: true }
  }
}

export default function useCivitAi({
  searchType = 'search',
  type
}: {
  searchType?: 'search' | 'favorite' | 'recent'
  type: 'LORA' | 'TextualInversion'
}) {
  const [pendingSearch, setPendingSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<Embedding[]>([])

  const [hasError, setHasError] = useState<string | boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(-1) // Setting 0 here causes brief flash between loading finished and totalItems populated
  const [totalPages, setTotalPages] = useState(0)

  const fetchRecentOrFavoriteLoras = async (type: 'favorite' | 'recent') => {
    const results =
      type === 'favorite'
        ? await getFavoriteEnhancements('lora')
        : await getRecentlyUsedEnhancements('lora')
    const models = results.map((f) => f.model)

    setSearchResults(models as unknown as Embedding[])
  }

  const fetchCivitAiResults = useCallback(
    async (input?: string) => {
      setPendingSearch(true)
      const result = await getCivitaiSearchResults({
        input,
        page: 1,
        type
      })

      // Happens due to _dev_ environment firing calls twice
      if (result === false) return

      const { items = [], metadata = {}, error } = result

      if (error) {
        setHasError(
          'Unable to load data from CivitAI, please try again shortly.'
        )
        setPendingSearch(false)
        return
      }

      setSearchResults(items)
      setTotalItems(metadata.totalItems)
      setTotalPages(metadata.totalPages)

      setPendingSearch(false)
    },
    [type]
  )

  const debouncedSearchRequest = debounce(fetchCivitAiResults, 500)

  useEffect(() => {
    if (searchType === 'favorite') {
      fetchRecentOrFavoriteLoras('favorite')
    } else if (searchType === 'recent') {
      fetchRecentOrFavoriteLoras('recent')
    } else if (searchType === 'search') {
      setSearchResults(LORAS.items as unknown as Embedding[])
    }
  }, [searchType])

  useEffect(() => {
    // fetchCivitAiResults()
    // Ignore dependency array warning - we only want to fetch models once on initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    currentPage,
    debouncedSearchRequest,
    fetchCivitAiResults,
    hasError,
    pendingSearch,
    searchResults,
    setCurrentPage,
    setPendingSearch,
    totalItems,
    totalPages
  }
}
