import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

interface MasonryLayoutProps {
  children: ReactNode[]
  gap?: number
}

interface ChildProps {
  columnWidth?: number
}

const MasonryLayout: React.FC<MasonryLayoutProps> = ({ children, gap = 8 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [componentWidth, setComponentWidth] = useState<number | null>(null)

  const updateWidth = () => {
    if (containerRef.current) {
      setComponentWidth(containerRef.current.offsetWidth)
    }
  }

  useEffect(() => {
    updateWidth()
  }, [children])

  useEffect(() => {
    window.addEventListener('resize', updateWidth)

    return () => {
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  // Define the number of columns based on the component width
  const columns = useMemo(() => {
    if (!componentWidth) return 2
    if (componentWidth > 1900) return 7
    if (componentWidth > 1700) return 6
    if (componentWidth > 1500) return 5
    if (componentWidth > 1200) return 4
    if (componentWidth > 1000) return 3
    if (componentWidth > 512) return 2
    return 1
  }, [componentWidth])

  // Calculate the width of each column
  const columnWidth = componentWidth
    ? (componentWidth - gap * (columns - 1)) / columns
    : 0

  // Create columns and distribute children
  const columnWrapper = useMemo(() => {
    const wrapper: { [key: string]: ReactNode[] } = {}
    for (let i = 0; i < columns; i++) {
      wrapper[`column${i}`] = []
    }

    React.Children.forEach(children, (child, index) => {
      const columnIndex = index % columns
      if (React.isValidElement<ChildProps>(child)) {
        console.log(`columnWidth?`, columnWidth)
        wrapper[`column${columnIndex}`].push(
          <div
            style={{ marginBottom: `${gap}px` }}
            key={`image_${index}_col_${columnIndex}`}
          >
            {React.cloneElement(child, { columnWidth })}
          </div>
        )
      }
    })

    return wrapper
  }, [columns, children, gap, columnWidth])

  // Wrap each column's children in a div
  const renderedColumns = useMemo(() => {
    return Array.from({ length: columns }, (_, i) => (
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
    ))
  }, [columns, columnWrapper, gap])

  return (
    <div ref={containerRef} style={{ display: 'flex' }}>
      {renderedColumns}
    </div>
  )
}

export default MasonryLayout
