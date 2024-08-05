import { useState, useCallback, useRef, useEffect } from 'react'
import { DebouncedFunction, debounce } from '../_utils/debounce'
import {
  filterEnhancements,
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
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    nextPageUrl: null as string | null,
    previousPages: [] as string[]
  })

  const [localFilterTerm, setLocalFilterTerm] = useState('')
  const [pendingSearch, setPendingSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<Embedding[]>([])
  const [hasError, setHasError] = useState<string | boolean>(false)
  const [currentSearchTerm, setCurrentSearchTerm] = useState<
    string | undefined
  >(undefined)

  const abortControllerRef = useRef<AbortController | null>(null)
  const debouncedSearchRef = useRef<DebouncedFunction<
    typeof fetchCivitAiResults
  > | null>(null)

  const filterLocalResults = useCallback(
    async (input: string) => {
      if (searchType === 'favorite' || searchType === 'recent') {
        const filtered = await filterEnhancements(
          type === 'LORA' ? 'lora' : 'ti',
          searchType,
          input,
          paginationState.currentPage
        )
        setSearchResults(filtered.items as unknown as Embedding[])
        setPaginationState((prev) => ({
          ...prev,
          nextPageUrl:
            filtered.currentPage < filtered.totalPages ? 'next' : null
        }))
      }
    },
    [searchType, type, paginationState.currentPage]
  )

  const fetchRecentOrFavoriteLoras = useCallback(
    async (searchType: 'favorite' | 'recent') => {
      const enhancementType = type === 'LORA' ? 'lora' : 'ti'
      try {
        const result =
          searchType === 'favorite'
            ? await getFavoriteEnhancements(
                enhancementType,
                paginationState.currentPage
              )
            : await getRecentlyUsedEnhancements(
                enhancementType,
                paginationState.currentPage
              )

        return result
      } catch (error) {
        console.error('Error fetching recent or favorite LORAs:', error)
        setHasError('Unable to load recent or favorite enhancements.')
        return null
      }
    },
    [type, paginationState.currentPage]
  )

  const fetchCivitAiResults = useCallback(
    async (input?: string, url?: string) => {
      setHasError(false)

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      try {
        const result = await getCivitaiSearchResults({
          input,
          page: paginationState.currentPage,
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
          setPaginationState((prev) => ({
            ...prev,
            nextPageUrl: result.metadata.nextPage || null
          }))
          if (!url) {
            setCurrentSearchTerm(input)
            setPaginationState((prev) => ({
              ...prev,
              previousPages: [],
              currentPage: 1
            }))
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log('Request was aborted')
        } else {
          setHasError('An error occurred while fetching data.')
          console.error('Error fetching CivitAI results:', error)
        }
      }
    },
    [paginationState.currentPage, type]
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
    if (paginationState.nextPageUrl) {
      setPaginationState((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
        previousPages: [...prev.previousPages, `page=${prev.currentPage}`]
      }))
    }
  }, [paginationState.nextPageUrl])

  const goToPreviousPage = useCallback(() => {
    if (paginationState.previousPages.length > 0) {
      const prevPage =
        paginationState.previousPages[paginationState.previousPages.length - 1]
      setPaginationState((prev) => ({
        ...prev,
        currentPage: parseInt(prevPage.split('=')[1]),
        previousPages: prev.previousPages.slice(0, -1)
      }))
    }
  }, [paginationState.previousPages])

  useEffect(() => {
    const fetchData = async () => {
      setPendingSearch(true)
      try {
        if (searchType === 'favorite' || searchType === 'recent') {
          if (localFilterTerm) {
            await filterLocalResults(localFilterTerm)
          } else {
            const result = await fetchRecentOrFavoriteLoras(searchType)
            if (result) {
              setSearchResults(result.items as unknown as Embedding[])
              setPaginationState((prev) => ({
                ...prev,
                nextPageUrl:
                  result.currentPage < result.totalPages ? 'next' : null
              }))
            }
          }
        } else if (paginationState.nextPageUrl) {
          await fetchCivitAiResults(undefined, paginationState.nextPageUrl)
        } else if (currentSearchTerm) {
          await fetchCivitAiResults(currentSearchTerm)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setHasError('An error occurred while fetching data.')
      } finally {
        setPendingSearch(false)
      }
    }

    fetchData()
  }, [
    paginationState.currentPage,
    searchType,
    currentSearchTerm,
    localFilterTerm,
    fetchRecentOrFavoriteLoras,
    fetchCivitAiResults,
    filterLocalResults,
    paginationState.nextPageUrl
  ])

  useEffect(() => {
    if (searchType === 'favorite' || searchType === 'recent') {
      setPaginationState((prev) => ({
        ...prev,
        currentPage: 1,
        previousPages: []
      }))
    } else if (searchType === 'search') {
      const defaultResults = type === 'LORA' ? LORASJson : EmbeddingsJson
      setSearchResults(defaultResults.items as unknown as Embedding[])
    }
  }, [searchType, type])

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
    currentPage: paginationState.currentPage,
    debouncedSearchRequest,
    fetchCivitAiResults,
    hasError,
    pendingSearch,
    searchResults,
    goToNextPage,
    goToPreviousPage,
    hasNextPage: !!paginationState.nextPageUrl,
    hasPreviousPage: paginationState.previousPages.length > 0,
    setLocalFilterTerm
  }
}
