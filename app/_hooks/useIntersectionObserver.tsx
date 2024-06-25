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
  stopObserving: () => void
}

// Define the hook with type safety
const useIntersectionObserver = <T extends HTMLElement>(
  options: IntersectionObserverOptions
): IntersectionObserverHookReturn<T> => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<T>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const currentRef = ref.current // Copy ref.current to a local variable
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observerRef.current = observer

    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [options])

  const stopObserving = () => {
    if (observerRef.current && ref.current) {
      observerRef.current.unobserve(ref.current)
    }
  }

  return { ref, isIntersecting, stopObserving }
}

export default useIntersectionObserver
