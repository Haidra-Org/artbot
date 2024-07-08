/* eslint-disable @next/next/no-img-element */
import React from 'react'
import Image from '../Image'
import { ImageBlobBuffer } from '@/app/_data-models/ImageFile_Dexie'

interface CarouselImageProps {
  imageBlobBuffer: ImageBlobBuffer
  maxHeight?: number
  maxWidth?: number
}

const CarouselImage: React.FC<CarouselImageProps> = ({ imageBlobBuffer }) => {
  if (!imageBlobBuffer) return null

  return (
    <Image
      imageBlobBuffer={imageBlobBuffer}
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
