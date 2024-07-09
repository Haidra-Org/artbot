'use client'

import { useContainerWidth } from '@/app/_hooks/useContainerWidth'
import { ReactNode, ReactElement, Children, useRef, RefObject } from 'react'

interface MasonryLayoutProps {
  children: ReactNode
  gap?: number
  containerRef?: RefObject<HTMLDivElement>
}

const MasonryLayout = ({
  children,
  gap = 20,
  containerRef
}: MasonryLayoutProps) => {
  const defaultRef = useRef<HTMLDivElement>(null)
  const width = useContainerWidth(containerRef || defaultRef)

  if (!children || !width) return null

  let columns = 2
  if (width > 1900) {
    columns = 7
  } else if (width > 1700) {
    columns = 6
  } else if (width > 1500) {
    columns = 5
  } else if (width > 1200) {
    columns = 4
  } else if (width > 1000) {
    columns = 3
  } else if (width > 800) {
    columns = 2
  }

  const childrenArray = Children.toArray(children)
  if (childrenArray.length < columns) {
    columns = childrenArray.length
  }

  const columnWrapper: { [key: string]: ReactElement[] } = {}
  const result: ReactElement[] = []

  // create columns
  for (let i = 0; i < columns; i++) {
    columnWrapper[`column${i}`] = []
  }

  // divide children into columns
  for (let i = 0; i < childrenArray.length; i++) {
    const columnIndex = i % columns
    columnWrapper[`column${columnIndex}`].push(
      <div
        style={{ marginBottom: `${gap}px` }}
        key={`image_${i}_col_${columnIndex}`}
      >
        {childrenArray[i]}
      </div>
    )
  }

  // wrap children in each column with a div
  for (let i = 0; i < columns; i++) {
    result.push(
      <div
        style={{
          marginLeft: `${i > 0 ? gap : 0}px`,
          flex: 1
        }}
        key={`col_${i}`}
        className="is_col"
      >
        {columnWrapper[`column${i}`]}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex' }} ref={containerRef || defaultRef}>
      {result}
    </div>
  )
}

export default MasonryLayout
