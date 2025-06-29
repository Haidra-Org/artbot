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

// Helper function to build cache key for page 1
const buildPage1CacheKey = (input: string | undefined, type: CivitAiEnhancementType): string => {
  const query = input ? `&query=${input}` : ''
  const searchTypes = type === 'TextualInversion' ? 'types=TextualInversion' : 'types=LORA&types=LoCon'
  const page = '&page=1'
  // This matches the buildQuery function in civitaiWorker.ts
  return `${searchTypes}&sort=Highest%20Rated&limit=20${query}${page}&nsfw=false&baseModel=SD%201.4&baseModel=SD%201.5&baseModel=SD%201.5%20LCM&baseModel=SD%202.0&baseModel=SD%202.0%20768&baseModel=SD%202.1&baseModel=SD%202.1%20768&baseModel=SD%202.1%20Unclip&baseModel=SDXL%200.9&baseModel=SDXL%201.0&baseModel=SDXL%201.0%20LCM&baseModel=SDXL%20Turbo&baseModel=Pony&baseModel=Flux.1%20S&baseModel=Flux.1%20D&baseModel=NoobAI&baseModel=Illustrious`
}

export default function useCivitAi({
  searchType = 'search',
  type = 'LORA'
}: {
  searchType?: SearchType
  type: CivitAiEnhancementType
}) {
  console.log('[useCivitai] Hook initialized with:', { searchType, type })
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
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('')

  const abortControllerRef = useRef<AbortController | null>(null)
  const isFetchingRef = useRef(false)
  const isPaginatingRef = useRef(false)
  const lastFetchedUrlRef = useRef<string | null>(null)
  const lastSearchTermRef = useRef<string>('')
  const isMountedRef = useRef(true)
  const requestIdRef = useRef(0)
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
      console.log('[fetchCivitAiResults] Called with:', { input, url, searchType })
      
      // Generate a unique request ID for this request
      const currentRequestId = ++requestIdRef.current
      console.log('[fetchCivitAiResults] Request ID:', currentRequestId)
      
      // Cancel any pending debounced calls
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }

      // Build the effective URL for tracking
      const effectiveUrl = url || `search:${input || ''}_page:${paginationState.currentPage}_type:${type}`
      
      // Skip if we just fetched this exact URL (but allow if not fetching)
      if (lastFetchedUrlRef.current === effectiveUrl && searchResults.length > 0) {
        console.log('[fetchCivitAiResults] Skipping - already have results for this URL:', {
          effectiveUrl,
          resultsCount: searchResults.length
        })
        return
      }

      console.log('[fetchCivitAiResults] Starting fetch...')
      isFetchingRef.current = true
      lastFetchedUrlRef.current = effectiveUrl
      setHasError(false)
      setPendingSearch(true)

      // Create a new abort controller for this request
      const currentAbortController = createAbortController()
      
      // Only abort if it's a NEW search (not pagination or same search)
      if (abortControllerRef.current && !url && input !== lastSearchTermRef.current && input !== undefined) {
        console.log('[fetchCivitAiResults] Aborting previous request for new search')
        abortControllerRef.current.abort()
      }
      
      // Store the new controller
      abortControllerRef.current = currentAbortController

      try {
        console.log('[fetchCivitAiResults] Calling getCivitaiSearchResults with:', {
          input,
          page: url ? undefined : paginationState.currentPage,
          type,
          url
        })
        const result = await getCivitaiSearchResults({
          input,
          page: url ? undefined : paginationState.currentPage, // Don't pass page when using URL
          type,
          signal: currentAbortController.signal,
          url
        })

        console.log('[fetchCivitAiResults] Got result:', {
          error: result.error,
          itemCount: result.items?.length,
          hasMetadata: !!result.metadata,
          requestId: currentRequestId,
          currentRequestId: requestIdRef.current,
          isMounted: isMountedRef.current
        })
        
        // Only process results if component is still mounted
        if (!isMountedRef.current) {
          console.log('[fetchCivitAiResults] Component unmounted, ignoring results')
          return
        }
        
        if (result.error) {
          setHasError(
            'Unable to load data from CivitAI, please try again shortly.'
          )
        } else {
          setSearchResults(result.items)
          const nextPageUrl = result.metadata.nextPage || null
          
          if (!url) {
            // New search - reset to page 1 but keep the nextPageUrl
            // Update search term
            setCurrentSearchTerm(input || '')
            lastFetchedUrlRef.current = null // Reset the last fetched URL for new searches
            
            // Store the actual cache key that was used for page 1
            const page1CacheKey = buildPage1CacheKey(input, type)
            
            setPaginationState(() => ({
              currentPage: 1,
              currentPageUrl: page1CacheKey,
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
        console.log('[fetchCivitAiResults] Finally block - cleaning up')
        // Always clear the fetching flag
        isFetchingRef.current = false
        isPaginatingRef.current = false
        
        // Only update pending search if component is still mounted
        if (isMountedRef.current) {
          setPendingSearch(false)
        }
      }
    },
    [paginationState.currentPage, type, searchResults.length, updatePaginationState]
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
    console.log('[debouncedSearchRequest] Called with:', input)
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(input)
    }
  }, [])

  const goToNextPage = useCallback(async () => {
    
    if (paginationState.nextPageUrl && !isFetchingRef.current) {
      isPaginatingRef.current = true
      // Store the current page's URL before moving to next
      const currentPageUrl = paginationState.currentPageUrl
      
      console.log('[goToNextPage] Storing current page URL:', currentPageUrl)
      
      // Update page number and store previous page URL
      setPaginationState((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
        previousPages: [...prev.previousPages, `page=${prev.currentPage}`],
        previousPageUrls: [...prev.previousPageUrls, currentPageUrl]
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
        
        console.log('[goToPreviousPage] Using previous URL:', previousUrl, 'isFirstPage:', isFirstPage)
        
        // Update state
        setPaginationState((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
          currentPageUrl: previousUrl,
          previousPages: prev.previousPages.slice(0, -1),
          previousPageUrls: prev.previousPageUrls.slice(0, -1)
        }))
        
        // For cached pages, check if we're going back to page 1
        if (isFirstPage) {
          // Going back to page 1 - use the stored cache key as URL parameter
          const page1CacheKey = buildPage1CacheKey(currentSearchTerm, type)
          await fetchCivitAiResults(undefined, page1CacheKey)
        } else if (previousUrl) {
          // This is an actual URL from the API for pages > 1
          await fetchCivitAiResults(undefined, previousUrl)
        } else {
          // Fallback - shouldn't happen
          await fetchCivitAiResults(currentSearchTerm || '')
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
    console.log('[Main Effect] Running with:', {
      searchType,
      localFilterTerm,
      currentSearchTerm,
      currentPage: paginationState.currentPage,
      isPaginating: isPaginatingRef.current,
      hasResults: searchResults.length > 0,
      lastSearchTerm: lastSearchTermRef.current
    })
    
    const fetchData = async () => {
      try {
        if (searchType === 'favorite' || searchType === 'recent') {
          setPendingSearch(true)
          await filterLocalResults(localFilterTerm, paginationState.currentPage)
          setPendingSearch(false)
        } else if (searchType === 'search' && paginationState.currentPage === 1 && !isPaginatingRef.current) {
          // For search type: only fetch on page 1 when not paginating
          // Check if we have results or if this is a new search term
          const shouldFetch = searchResults.length === 0 || currentSearchTerm !== lastSearchTermRef.current
          
          console.log('[Main Effect] Search type check:', {
            shouldFetch,
            hasResults: searchResults.length > 0,
            currentSearchTerm,
            lastSearchTerm: lastSearchTermRef.current
          })
          
          if (shouldFetch) {
            console.log('[Main Effect] Fetching for search type...')
            lastSearchTermRef.current = currentSearchTerm
            lastFetchedUrlRef.current = null // Reset to allow fetch
            await fetchCivitAiResults(currentSearchTerm)
          } else {
            console.log('[Main Effect] Skipping fetch - already have results for this search term')
          }
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
    searchResults.length,
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

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true
    console.log('[useCivitai] Component mounted')
    
    return () => {
      console.log('[useCivitai] Cleanup effect - component unmounting')
      isMountedRef.current = false
      
      // Only cancel debounced calls, not active requests
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }
      
      // Note: We're NOT aborting requests on unmount anymore
      // This prevents the immediate unmount/remount cycle from breaking the initial fetch
    }
  }, [])

  // Log the state we're returning
  console.log('[useCivitai] Returning state:', {
    currentPage: paginationState.currentPage,
    hasError,
    pendingSearch,
    searchResultsCount: searchResults.length,
    hasNextPage: !!paginationState.nextPageUrl,
    hasPreviousPage: paginationState.previousPages.length > 0
  })
  
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
