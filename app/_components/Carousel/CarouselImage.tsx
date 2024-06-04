/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'

interface CarouselImageProps {
  imageBlob: Blob
}

const CarouselImage: React.FC<CarouselImageProps> = ({ imageBlob }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    // Create an object URL for the blob
    const url = URL.createObjectURL(imageBlob)
    setImageUrl(url)

    // Cleanup function to revoke the object URL
    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [imageBlob])

  if (!imageUrl) return null

  return <img src={imageUrl} alt="Carousel Slide" />
}

export default CarouselImage
