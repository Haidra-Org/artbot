/* eslint-disable @next/next/no-img-element */
import React from 'react'
import { useImageView } from './ImageViewProvider'
import CarouselImage from '../Carousel/CarouselImage'
import Carousel from '../Carousel'
import { ImageBlobBuffer } from '@/app/_data-models/ImageFile_Dexie'

// Prevents re-rendering of the same image multiple times as parent is updated
const ImageViewImage = React.memo(() => {
  const { imageBlobBuffer, imageData, setCurrentImageId } = useImageView()
  const { imageFiles } = imageData

  if (!imageFiles) return null
  if (!imageBlobBuffer) return null

  return (
    <div style={{ maxWidth: `${imageData?.imageRequest?.width}px` }}>
      <Carousel
        numSlides={imageFiles.length}
        onSlideChange={(num: number) => {
          setCurrentImageId(imageFiles[num].image_id)
        }}
        options={{ loop: true }}
      >
        {imageFiles.map((image) => (
          <CarouselImage
            key={image.image_id}
            imageBlobBuffer={image.imageBlobBuffer as ImageBlobBuffer}
            maxWidth={imageData?.imageRequest?.width}
          />
        ))}
      </Carousel>
    </div>
  )
})

ImageViewImage.displayName = 'ImageViewImage'
export default ImageViewImage
