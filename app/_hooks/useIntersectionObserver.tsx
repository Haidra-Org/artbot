import { useEffect, useState, useRef, MutableRefObject } from 'react'

// Define the types for the hook options and return value
interface IntersectionObserverOptions {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

interface IntersectionObserverHookReturn<T> {
  ref: MutableRefObject<T | null>
  isIntersecting: boolean
}

const useIntersectionObserver = <T extends HTMLElement>(
  options: IntersectionObserverOptions,
  loadMargin: string,
  unloadMargin: string
): IntersectionObserverHookReturn<T> => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<T>(null)

  useEffect(() => {
    const currentRef = ref.current
    let observer: IntersectionObserver

    const handleIntersection = ([entry]: IntersectionObserverEntry[]) => {
      // Use different margins based on whether loading or unloading
      if (entry.isIntersecting) {
        observer.disconnect()
        observer = new IntersectionObserver(handleIntersection, {
          ...options,
          rootMargin: unloadMargin
        })
        observer.observe(currentRef!)
        setIsIntersecting(true)
      } else {
        setIsIntersecting(false)
      }
    }

    observer = new IntersectionObserver(handleIntersection, {
      ...options,
      rootMargin: loadMargin
    })

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [options, loadMargin, unloadMargin])

  return { ref, isIntersecting }
}

export default useIntersectionObserver
