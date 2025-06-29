import { CivitAiSearchParams } from '@/app/_types/ArtbotTypes'
import { AppSettings } from '../../_data-models/AppSettings'
import { Embedding } from '@/app/_data-models/Civitai'
import { AppConstants } from '@/app/_data-models/AppConstants'

const API_BASE_URL = 'https://civitai.com/api/v1'

export interface CivitAiMetadata {
  nextCursor: string
  nextPage: string
  currentPage: number
  pageSize: number
}

let worker: Worker | null = null

export const getCivitaiSearchResults = async ({
  input,
  page = 1,
  limit = 20,
  type = 'LORA',
  signal,
  url
}: CivitAiSearchParams & { url?: string }): Promise<{
  items: Embedding[]
  metadata: CivitAiMetadata
  error?: boolean
  cached?: boolean
}> => {
  console.log('[getCivitaiSearchResults] Called with:', { input, page, limit, type, url })
  return new Promise((resolve) => {
    if (!worker) {
      console.log('[getCivitaiSearchResults] Creating new worker')
      worker = new Worker(new URL('./civitaiWorker.ts', import.meta.url))
    } else {
      console.log('[getCivitaiSearchResults] Using existing worker')
    }

    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        console.log('[getCivitaiSearchResults] Request timed out')
        hasResolved = true
        resolve({ items: [], metadata: {} as CivitAiMetadata, error: true })
      }
    }, AppConstants.CIVITAI_API_TIMEOUT_MS)

    const messageHandler = (event: MessageEvent) => {
      console.log('[getCivitaiSearchResults] Received message from worker:', event.data.type)
      clearTimeout(timeoutId)

      if (!hasResolved) {
        if (event.data.type === 'result') {
          console.log('[getCivitaiSearchResults] Got successful result from worker')
          hasResolved = true
          resolve({
            items: event.data.data.items || [],
            metadata: event.data.data.metadata || {},
            error: false,
            cached: event.data.cached || false
          })
        } else if (event.data.type === 'error') {
          hasResolved = true
          resolve({ items: [], metadata: {} as CivitAiMetadata, error: true })
        }
      }

      // Remove the event listener after handling the message
      worker?.removeEventListener('message', messageHandler)
    }

    worker.addEventListener('message', messageHandler)

    worker.onerror = (error) => {
      clearTimeout(timeoutId)
      console.error('Worker error:', error)
      resolve({ items: [], metadata: {} as CivitAiMetadata, error: true })
      worker?.removeEventListener('message', messageHandler)
    }

    const userBaseModelFilters = AppSettings.get('civitAiBaseModelFilter')
    
    console.log('[getCivitaiSearchResults] Posting to worker:', {
      searchParams: { input, page, limit, type, url },
      userBaseModelFilters
    })

    worker.postMessage({
      searchParams: { input, page, limit, type, url },
      userBaseModelFilters,
      API_BASE_URL
    })

    // Track if we've already resolved
    let hasResolved = false
    
    // Handle abort signal
    if (signal) {
      // Check if already aborted
      if (signal.aborted) {
        console.log('[getCivitaiSearchResults] Request already aborted on start')
        hasResolved = true
        resolve({ items: [], metadata: {} as CivitAiMetadata, error: true })
        return
      }
      
      signal.addEventListener('abort', () => {
        if (!hasResolved) {
          clearTimeout(timeoutId)
          console.log('[getCivitaiSearchResults] Request was aborted - signal received')
          hasResolved = true
          resolve({ items: [], metadata: {} as CivitAiMetadata, error: true })
          worker?.removeEventListener('message', messageHandler)
        }
      })
    }
  })
}
