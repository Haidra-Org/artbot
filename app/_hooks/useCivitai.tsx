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
    currentPageUrl: null as string | null,
    nextPageUrl: null as string | null,
    previousPages: [] as string[],
    previousPageUrls: [] as string[]
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
  const isPaginatingRef = useRef(false)
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
        currentPageUrl: currentPage === 1 ? null : previousPages[previousPages.length - 1],
        nextPageUrl,
        previousPages,
        previousPageUrls: []
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
        setPaginationState((prev) => ({
          currentPage: page,
          currentPageUrl: page === 1 ? null : `page=${page}`,
          nextPageUrl: filtered.currentPage < filtered.totalPages ? 'next' : null,
          previousPages: page > 1 ? [...prev.previousPages, `page=${page - 1}`] : [],
          previousPageUrls: prev.previousPageUrls
        }))
      }
    },
    [searchType, type]
  )

  const setLocalFilterTermAndResetPage = useCallback(
    (term: string) => {
      setLocalFilterTerm(term)
      setPaginationState(() => ({
        currentPage: 1,
        currentPageUrl: null,
        nextPageUrl: null,
        previousPages: [],
        previousPageUrls: []
      }))
    },
    []
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

      // Only abort if we're starting a new search, not paginating
      if (!url && abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = createAbortController()

      try {
        const result = await getCivitaiSearchResults({
          input,
          page: url ? undefined : paginationState.currentPage, // Don't pass page when using URL
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
            setPaginationState(() => ({
              currentPage: 1,
              currentPageUrl: null,
              nextPageUrl: nextPageUrl,
              previousPages: [],
              previousPageUrls: []
            }))
          } else {
            // Pagination - we're fetching a new page
            // Check if we've reached the end (same URL returned)
            const hasReachedEnd = url === nextPageUrl
            setPaginationState((prev) => {
              return {
                ...prev,
                currentPageUrl: url,
                nextPageUrl: hasReachedEnd ? null : nextPageUrl
              }
            })
          }
        }
      } catch (error) {
        const errorMessage = handleSearchError(error)
        if (errorMessage) setHasError(errorMessage)
      } finally {
        isFetchingRef.current = false
        isPaginatingRef.current = false
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
      isPaginatingRef.current = true
      // Store the current page's URL before moving to next
      const currentPageUrl = paginationState.currentPageUrl
      
      // Update page number and store previous page URL
      setPaginationState((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
        previousPages: [...prev.previousPages, `page=${prev.currentPage}`],
        previousPageUrls: [...prev.previousPageUrls, currentPageUrl || 'page=1']
      }))
      await fetchCivitAiResults(undefined, paginationState.nextPageUrl)
      isPaginatingRef.current = false
    }
  }, [paginationState.nextPageUrl, paginationState.currentPageUrl, fetchCivitAiResults])

  const goToPreviousPage = useCallback(async () => {
    
    if (paginationState.currentPage > 1 && !isFetchingRef.current) {
      isPaginatingRef.current = true
      
      if (paginationState.previousPageUrls.length > 0) {
        // Get the last previous page URL
        const previousUrl = paginationState.previousPageUrls[paginationState.previousPageUrls.length - 1]
        const isFirstPage = paginationState.currentPage === 2
        
        // Update state
        setPaginationState((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
          currentPageUrl: previousUrl === 'page=1' ? null : previousUrl,
          previousPages: prev.previousPages.slice(0, -1),
          previousPageUrls: prev.previousPageUrls.slice(0, -1)
        }))
        
        
        // If going back to page 1, fetch without URL
        if (isFirstPage || previousUrl === 'page=1') {
          await fetchCivitAiResults(currentSearchTerm || '')
        } else {
          await fetchCivitAiResults(undefined, previousUrl)
        }
      } else {
        // Fallback to page 1
        setPaginationState(() => ({
          currentPage: 1,
          currentPageUrl: null,
          nextPageUrl: null,
          previousPages: [],
          previousPageUrls: []
        }))
        await fetchCivitAiResults(currentSearchTerm || '')
      }
      
      isPaginatingRef.current = false
    }
  }, [paginationState.currentPage, paginationState.previousPageUrls, currentSearchTerm, fetchCivitAiResults])

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (searchType === 'favorite' || searchType === 'recent') {
          setPendingSearch(true)
          await filterLocalResults(localFilterTerm, paginationState.currentPage)
          setPendingSearch(false)
        } else if (currentSearchTerm !== undefined && paginationState.currentPage === 1 && !isPaginatingRef.current) {
          // Only fetch on page 1 or when search term changes
          // Pagination is handled by goToNextPage/goToPreviousPage
          // Don't interfere with ongoing pagination
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
      setPaginationState(() => ({
        currentPage: 1,
        currentPageUrl: null,
        nextPageUrl: null,
        previousPages: [],
        previousPageUrls: []
      }))
    }
  }, [searchType])

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
