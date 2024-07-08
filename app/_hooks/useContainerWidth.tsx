// useContainerWidth.ts
import { useState, useEffect, RefObject } from 'react'

export const useContainerWidth = (containerRef: RefObject<HTMLDivElement>) => {
  const [width, setWidth] = useState<number | null>(null)

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth)
      } else {
        setWidth(window.innerWidth)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [containerRef])

  return width
}
