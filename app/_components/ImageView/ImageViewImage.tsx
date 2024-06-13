/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react'
import { useImageView } from './ImageViewProvider'
import CarouselImage from '../Carousel/CarouselImage'
import Carousel from '../Carousel'

const defaultImage =
  'data:image/gif;base64,R0lGODdhAQABAJEAAAAAAB8fH////wAAACH5BAkAAAMALAAAAAABAAEAAAICTAEAOw=='

// Prevents re-rendering of the same image multiple times as parent is updated
const ImageViewImage = React.memo(() => {
  const { artbot_id, imageBlob, imageData } = useImageView()
  const { imageFiles } = imageData

  const [imageUrl, setImageUrl] = useState(defaultImage)

  useEffect(() => {
    let isMounted = true // To prevent state update on unmounted component

    const fetchImage = async () => {
      if (imageBlob && isMounted) {
        const url = URL.createObjectURL(imageBlob)
        setImageUrl(url)
      }
    }

    fetchImage()

    return () => {
      isMounted = false // Clean up to prevent memory leaks

      if (imageUrl !== defaultImage) {
        URL.revokeObjectURL(imageUrl) // Clean up blob URL
      }
    }

    // imageUrl in this dep array causes issue with URL.createObjectURL re-rendering thousands of times.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artbot_id, imageBlob])

  if (!imageBlob) return null

  return (
    <Carousel numSlides={imageFiles.length} options={{ loop: true }}>
      {imageFiles.map((image) => (
        <CarouselImage
          key={image.image_id}
          imageBlob={image.imageBlob as Blob}
          maxWidth={imageData?.imageRequest?.width}
        />
      ))}
    </Carousel>
  )
})

ImageViewImage.displayName = 'ImageViewImage'
export default ImageViewImage
