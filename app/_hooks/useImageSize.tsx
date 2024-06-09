import { useState, useCallback, useEffect } from 'react'

export default function useImageSize(
  initialWidth: number,
  initialHeight: number
) {
  const [width] = useState(initialWidth)
  const [height] = useState(initialHeight)
  const [aspectRatio, setAspectRatio] = useState(initialWidth / initialHeight)

  // Function to calculate and set the aspect ratio
  const calculateAspectRatio = useCallback(() => {
    return width / height
  }, [width, height])

  useEffect(() => {
    setAspectRatio(calculateAspectRatio())
  }, [calculateAspectRatio])

  // Function to update dimensions while maintaining the aspect ratio
  const getNewDimensions = ({
    w,
    h,
    size,
    side
  }: {
    w: number
    h: number
    size: number
    side: 'width' | 'height'
  }) => {
    let newWidth = w
    let newHeight = h

    if (side === 'width') {
      // Calculate potential new width
      const potentialNewWidth = Math.round(size / 64) * 64
      newWidth = potentialNewWidth
      newHeight = Math.round(newWidth / aspectRatio / 64) * 64

      // Prevent changes to height if it would exceed 3072
      if (newHeight >= 3072 || newHeight <= 64) {
        if (newHeight >= 3072) {
          newHeight = 3072
        } else if (newHeight <= 64) {
          newHeight = 64
        }

        // newHeight = h // Reset to original height
        newWidth = Math.round((newHeight * aspectRatio) / 64) * 64
      }
    } else {
      // Calculate potential new height
      const potentialNewHeight = Math.round(size / 64) * 64

      newHeight = potentialNewHeight
      newWidth = Math.round((newHeight * aspectRatio) / 64) * 64

      // Prevent changes to width if it would exceed 3072
      if (newWidth >= 3072 || newWidth <= 64) {
        if (newWidth >= 3072) {
          newWidth = 3072
        } else if (newWidth <= 64) {
          newWidth = 64
        }

        newHeight = Math.round(newWidth / aspectRatio / 64) * 64
      }
    }

    // Ensure the dimensions are within the specified bounds
    newWidth = Math.max(64, Math.min(3072, newWidth))
    newHeight = Math.max(64, Math.min(3072, newHeight))

    // Return the adjusted dimensions
    return { adjustedWidth: newWidth, adjustedHeight: newHeight }
  }

  // Function to update width and height directly, and recalculate the aspect ratio
  const updateAspectRatio = (newWidth: number, newHeight: number) => {
    setAspectRatio(newWidth / newHeight)
  }

  return {
    adjustedWidth: width,
    adjustedHeight: height,
    aspectRatio,
    getNewDimensions,
    updateAspectRatio
  }
}
