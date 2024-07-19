/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'
import { useImageView } from './ImageViewProvider'
import CarouselImage from '../Carousel/CarouselImage'
import Carousel from '../Carousel'
import { ImageBlobBuffer } from '@/app/_data-models/ImageFile_Dexie'

// Prevents re-rendering of the same image multiple times as parent is updated
const ImageViewImage = React.memo(() => {
  const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight)
  const { imageBlobBuffer, imageData, setCurrentImageId } = useImageView()
  const { imageFiles } = imageData

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (!imageFiles) return null
  if (!imageBlobBuffer) return null

  // Constrain max width of image so that multiple images don't show in carousel.
  const imageWidth =
    ((windowHeight - 72) * imageData?.imageRequest?.width) /
    imageData?.imageRequest?.height

  return (
    <div style={{ maxWidth: `${imageWidth}px` }}>
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
            maxWidth={imageWidth}
          />
        ))}
      </Carousel>
    </div>
  )
})

ImageViewImage.displayName = 'ImageViewImage'
export default ImageViewImage
