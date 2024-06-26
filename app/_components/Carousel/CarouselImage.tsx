/* eslint-disable @next/next/no-img-element */
import useImageBlobUrl from '@/app/_hooks/useImageBlobUrl'
import React from 'react'

interface CarouselImageProps {
  imageBlob: Blob
  maxHeight?: number
  maxWidth?: number
}

const CarouselImage: React.FC<CarouselImageProps> = ({ imageBlob }) => {
  const imageUrl = useImageBlobUrl(imageBlob)

  if (!imageUrl) return null

  return (
    <img
      src={imageUrl}
      alt="Carousel Slide"
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        objectFit: 'contain'
      }}
    />
  )
}

export default CarouselImage
