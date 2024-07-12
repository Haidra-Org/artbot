import { useState, useCallback, useRef, useEffect } from 'react'
import { DebouncedFunction, debounce } from '../_utils/debounce'
import {
  getFavoriteEnhancements,
  getRecentlyUsedEnhancements
} from '../_db/imageEnhancementModules'
import LORASJson from '../_components/AdvancedOptions/LoRAs/_LORAs.json'
import EmbeddingsJson from '../_components/AdvancedOptions/LoRAs/_Embeddings.json'
import { Embedding } from '../_data-models/Civitai'
import { getCivitaiSearchResults } from '../_api/civitai/models'
import { CivitAiEnhancementType } from '../_types/ArtbotTypes'

export type SearchType = 'search' | 'favorite' | 'recent'

export default function useCivitAi({
  searchType = 'search',
  type = 'LORA'
}: {
  searchType?: SearchType
  type: CivitAiEnhancementType
}) {
  const [pendingSearch, setPendingSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<Embedding[]>([])
  const [hasError, setHasError] = useState<string | boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)
  const [previousPages, setPreviousPages] = useState<string[]>([])
  const [currentSearchTerm, setCurrentSearchTerm] = useState<
    string | undefined
  >(undefined)

  const abortControllerRef = useRef<AbortController | null>(null)
  const debouncedSearchRef = useRef<DebouncedFunction<
    typeof fetchCivitAiResults
  > | null>(null)

  const fetchRecentOrFavoriteLoras = useCallback(
    async (searchType: 'favorite' | 'recent') => {
      const enhancementType = type === 'LORA' ? 'lora' : 'ti'
      try {
        const results =
          searchType === 'favorite'
            ? await getFavoriteEnhancements(enhancementType)
            : await getRecentlyUsedEnhancements(enhancementType)
        const models = results.map((f) => f.model)
        setSearchResults(models as unknown as Embedding[])
      } catch (error) {
        console.error('Error fetching recent or favorite LORAs:', error)
        setHasError('Unable to load recent or favorite enhancements.')
      }
    },
    [type]
  )

  const fetchCivitAiResults = useCallback(
    async (input?: string, url?: string) => {
      setPendingSearch(true)
      setHasError(false)

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        const result = await getCivitaiSearchResults({
          input,
          page: currentPage,
          type,
          signal: abortControllerRef.current.signal,
          url
        })

        if (result.error) {
          setHasError(
            'Unable to load data from CivitAI, please try again shortly.'
          )
        } else {
          setSearchResults(result.items)
          setNextPageUrl(result.metadata.nextPage || null)
          if (!url) {
            setCurrentSearchTerm(input)
            setPreviousPages([])
            setCurrentPage(1)
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Request was aborted')
        } else {
          setHasError('An error occurred while fetching data.')
          console.error('Error fetching CivitAI results:', error)
        }
      } finally {
        setPendingSearch(false)
      }
    },
    [currentPage, type]
  )

  useEffect(() => {
    debouncedSearchRef.current = debounce(fetchCivitAiResults, 500)

    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }
    }
  }, [fetchCivitAiResults])

  const debouncedSearchRequest = useCallback((input?: string) => {
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(input)
    }
  }, [])

  const goToNextPage = useCallback(() => {
    if (nextPageUrl) {
      setPreviousPages((prev) => [
        ...prev,
        `page=${currentPage}&input=${currentSearchTerm}`
      ])
      fetchCivitAiResults(undefined, nextPageUrl)
      setCurrentPage((prev) => prev + 1)
    }
  }, [nextPageUrl, fetchCivitAiResults, currentPage, currentSearchTerm])

  const goToPreviousPage = useCallback(() => {
    if (previousPages.length > 0) {
      const prevPage = previousPages[previousPages.length - 1]
      setPreviousPages((prev) => prev.slice(0, -1))
      const [page, input] = prevPage.split('&input=')
      setCurrentPage(parseInt(page.split('=')[1]))
      fetchCivitAiResults(input)
    }
  }, [previousPages, fetchCivitAiResults])

  useEffect(() => {
    if (searchType === 'favorite') {
      fetchRecentOrFavoriteLoras('favorite')
    } else if (searchType === 'recent') {
      fetchRecentOrFavoriteLoras('recent')
    } else if (searchType === 'search') {
      const defaultResults = type === 'LORA' ? LORASJson : EmbeddingsJson
      setSearchResults(defaultResults.items as unknown as Embedding[])
    }
  }, [fetchRecentOrFavoriteLoras, searchType, type])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }
    }
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
    goToNextPage,
    goToPreviousPage,
    hasNextPage: !!nextPageUrl,
    hasPreviousPage: previousPages.length > 0
  }
}
