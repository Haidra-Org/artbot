import { useState, useRef, useCallback } from 'react'

// Custom hook for fetching data with a timeout and abort functionality
function useFetchWithTimeout() {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const timeoutIdRef = useRef<number | null>(null)

  const fetchData = useCallback(
    async (url: string, timeout: number = 8000) => {
      setLoading(true)
      setError(null)
      setData(null)

      const controller = new AbortController()
      controllerRef.current = controller
      const signal = controller.signal

      // Set a timeout to abort the request and distinguish it as a timeout error
      timeoutIdRef.current = window.setTimeout(() => {
        controller.abort()
        setError('Request timed out.')
      }, timeout)

      try {
        const response = await fetch(url, { signal })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        setData(data)
        // @ts-expect-error "never" type is fine here
      } catch (err: never) {
        // Only set the error if it wasn't already set by a timeout
        if (error === null) {
          if (err.name === 'AbortError') {
            setError('Fetch request was canceled by the user.')
          } else {
            setError('Fetch error: ' + err.message)
          }
        }
      } finally {
        setLoading(false)
        // Clear the timeout after the fetch is completed or aborted
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current)
          timeoutIdRef.current = null
        }
        controllerRef.current = null
      }
    },
    [error]
  )

  const cancelFetch = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort()
      setError('Fetch request was canceled by the user.')
    }
  }, [])

  return { data, loading, error, fetchData, cancelFetch }
}

export default useFetchWithTimeout
