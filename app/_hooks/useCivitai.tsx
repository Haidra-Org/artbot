import { useState, useCallback, useRef, useEffect } from 'react'
import { DebouncedFunction, debounce } from '../_utils/debounce'
import { filterEnhancements } from '../_db/imageEnhancementModules'
import { Embedding } from '../_data-models/Civitai'
import { getCivitaiSearchResults } from '../_api/civitai/models'
import { CivitAiEnhancementType } from '../_types/ArtbotTypes'

export type SearchType = 'search' | 'favorite' | 'recent'

// Utility functions

const createAbortController = (): AbortController => {
  return new AbortController()
}

const handleSearchError = (error: unknown): string => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    console.log('Request was aborted')
    return ''
  } else {
    console.error('Error fetching CivitAI results:', error)
    return 'An error occurred while fetching data.'
  }
}

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
  const isFetchingRef = useRef(false)
  const debouncedSearchRef = useRef<DebouncedFunction<
    typeof fetchCivitAiResults
  > | null>(null)

  const updatePaginationState = useCallback(
    (
      currentPage: number,
      nextPageUrl: string | null,
      previousPages: string[]
    ) => {
      return {
        currentPage,
        nextPageUrl,
        previousPages
      }
    },
    []
  )

  const filterLocalResults = useCallback(
    async (input: string, page: number = 1) => {
      if (searchType === 'favorite' || searchType === 'recent') {
        const filtered = await filterEnhancements(
          type === 'LORA' ? 'lora' : 'ti',
          searchType,
          input,
          page
        )
        setSearchResults(filtered.items as unknown as Embedding[])
        setPaginationState((prev) =>
          updatePaginationState(
            page,
            filtered.currentPage < filtered.totalPages ? 'next' : null,
            page > 1 ? [...prev.previousPages, `page=${page - 1}`] : []
          )
        )
      }
    },
    [searchType, type, updatePaginationState]
  )

  const setLocalFilterTermAndResetPage = useCallback(
    (term: string) => {
      setLocalFilterTerm(term)
      setPaginationState(() => updatePaginationState(1, null, []))
    },
    [updatePaginationState]
  )

  const fetchCivitAiResults = useCallback(
    async (input?: string, url?: string) => {
      // Cancel any pending debounced calls
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }

      if (isFetchingRef.current) {
        return
      }

      isFetchingRef.current = true
      setHasError(false)
      setPendingSearch(true)

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = createAbortController()

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
          const nextPageUrl = result.metadata.nextPage || null
          
          if (!url) {
            // New search - reset to page 1 but keep the nextPageUrl
            setCurrentSearchTerm(input || '')
            setPaginationState(() => updatePaginationState(1, nextPageUrl, []))
          } else {
            // Pagination - update with current page info
            setPaginationState((prev) =>
              updatePaginationState(
                prev.currentPage,
                nextPageUrl,
                prev.previousPages
              )
            )
          }
        }
      } catch (error) {
        const errorMessage = handleSearchError(error)
        if (errorMessage) setHasError(errorMessage)
      } finally {
        isFetchingRef.current = false
        setPendingSearch(false)
      }
    },
    [paginationState.currentPage, type, updatePaginationState]
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

  const goToNextPage = useCallback(async () => {
    if (paginationState.nextPageUrl && !isFetchingRef.current) {
      setPaginationState((prev) =>
        updatePaginationState(prev.currentPage + 1, prev.nextPageUrl, [
          ...prev.previousPages,
          `page=${prev.currentPage}`
        ])
      )
      await fetchCivitAiResults(undefined, paginationState.nextPageUrl)
    }
  }, [paginationState.nextPageUrl, fetchCivitAiResults, updatePaginationState])

  const goToPreviousPage = useCallback(() => {
    // For now, just go back to page 1
    // TODO: Implement proper previous page navigation
    if (paginationState.currentPage > 1) {
      setCurrentSearchTerm(currentSearchTerm || '')
      setPaginationState(() => updatePaginationState(1, null, []))
    }
  }, [paginationState.currentPage, currentSearchTerm, updatePaginationState])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (searchType === 'favorite' || searchType === 'recent') {
          setPendingSearch(true)
          await filterLocalResults(localFilterTerm, paginationState.currentPage)
          setPendingSearch(false)
        } else if (currentSearchTerm !== undefined) {
          await fetchCivitAiResults(currentSearchTerm)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setHasError('An error occurred while fetching data.')
        setPendingSearch(false)
      }
    }

    fetchData()
  }, [
    searchType,
    localFilterTerm,
    currentSearchTerm,
    paginationState.currentPage,
    filterLocalResults,
    fetchCivitAiResults
  ])

  useEffect(() => {
    if (searchType === 'favorite' || searchType === 'recent') {
      setPaginationState(() => updatePaginationState(1, null, []))
    }
  }, [searchType, updatePaginationState])

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
    setLocalFilterTermAndResetPage
  }
}
