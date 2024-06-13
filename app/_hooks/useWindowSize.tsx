import { useState, useEffect } from 'react'
import { debounce } from '../_utils/debounce'

export interface WindowSize {
  width: number | undefined
  height: number | undefined
}

export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    // Handler to call on window resize
    const handleResize = () => {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Debounced version of the handleResize function
    const debouncedHandleResize = debounce(handleResize, 200)

    // Add event listener with debounced handler
    window.addEventListener('resize', debouncedHandleResize)

    // Call handler right away so state gets updated with initial window size
    debouncedHandleResize()

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', debouncedHandleResize)
  }, []) // Empty array ensures that effect is only run on mount

  return windowSize
}
