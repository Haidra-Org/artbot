import { useEffect, useState, RefObject } from 'react'

const useResizeObserver = (ref: RefObject<HTMLElement>) => {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const observedElement = ref.current
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        setWidth(entries[0].contentRect.width)
      }
    })

    if (observedElement) {
      resizeObserver.observe(observedElement)
    }

    return () => {
      if (observedElement) {
        resizeObserver.unobserve(observedElement)
      }
    }
  }, [ref])

  return width
}

export default useResizeObserver
