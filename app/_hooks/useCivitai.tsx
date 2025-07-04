import { useState, useCallback, useRef, useEffect } from 'react'
import { DebouncedFunction, debounce } from '../_utils/debounce'
import { filterEnhancements } from '../_db/imageEnhancementModules'
import { Embedding } from '../_data-models/Civitai'
import { getCivitaiSearchResults } from '../_api/civitai/models'
import { CivitAiEnhancementType } from '../_types/ArtbotTypes'
import { buildPage1CacheKey as buildDynamicPage1CacheKey } from '../_utils/civitaiCacheKey'
import { AppSettings } from '../_data-models/AppSettings'

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
  // Get user's base model filters from AppSettings
  const userBaseModelFilters = AppSettings.get('civitAiBaseModelFilter') || []
  
  // Use the shared utility to build the cache key with dynamic filters
  return buildDynamicPage1CacheKey(input, type, userBaseModelFilters)
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
      
      // Generate a unique request ID for this request
      ++requestIdRef.current
      
      // Cancel any pending debounced calls
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }

      // Build the effective URL for tracking, including filters
      const currentFilters = AppSettings.get('civitAiBaseModelFilter')
      const filterString = currentFilters.sort().join(',')
      const effectiveUrl = url || `search:${input || ''}_page:${paginationState.currentPage}_type:${type}_filters:${filterString}`
      
      // Skip if we just fetched this exact URL (but allow if not fetching)
      if (lastFetchedUrlRef.current === effectiveUrl && searchResults.length > 0) {
        return
      }

      isFetchingRef.current = true
      lastFetchedUrlRef.current = effectiveUrl
      setHasError(false)
      setPendingSearch(true)

      // Create a new abort controller for this request
      const currentAbortController = createAbortController()
      
      // Only abort if it's a NEW search (not pagination or same search)
      if (abortControllerRef.current && !url && input !== lastSearchTermRef.current && input !== undefined) {
        abortControllerRef.current.abort()
      }
      
      // Store the new controller
      abortControllerRef.current = currentAbortController

      try {
        const result = await getCivitaiSearchResults({
          input,
          page: url ? undefined : paginationState.currentPage, // Don't pass page when using URL
          type,
          signal: currentAbortController.signal,
          url
        })

        
        // Only process results if component is still mounted
        if (!isMountedRef.current) {
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
        // Always clear the fetching flag
        isFetchingRef.current = false
        isPaginatingRef.current = false
        
        // Only update pending search if component is still mounted
        if (isMountedRef.current) {
          setPendingSearch(false)
        }
      }
    },
    [paginationState.currentPage, type, searchResults.length]
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
        previousPageUrls: [...prev.previousPageUrls, ...(currentPageUrl ? [currentPageUrl] : [])]
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
  }, [paginationState.currentPage, paginationState.previousPageUrls, currentSearchTerm, fetchCivitAiResults, type])

  useEffect(() => {
    
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
          
          
          if (shouldFetch) {
            lastSearchTermRef.current = currentSearchTerm
            lastFetchedUrlRef.current = null // Reset to allow fetch
            await fetchCivitAiResults(currentSearchTerm)
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
    
    return () => {
      isMountedRef.current = false
      
      // Only cancel debounced calls, not active requests
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel()
      }
      
      // Note: We're NOT aborting requests on unmount anymore
      // This prevents the immediate unmount/remount cycle from breaking the initial fetch
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
