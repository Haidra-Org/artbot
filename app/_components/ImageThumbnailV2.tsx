/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { checkImageExistsInDexie } from '../_db/ImageFiles'

const defaultImage =
  'data:image/gif;base64,R0lGODdhAQABAJEAAAAAAB8fH////wAAACH5BAkAAAMALAAAAAABAAEAAAICTAEAOw=='

interface ImageThumbnailV2Props {
  alt: string
  artbot_id?: string
  image_id?: string
  height: number
  width: number
  onAspectRatioCalculated?: (aspectRatio: number) => void
}

const ImageThumbnailV2 = React.memo(
  ({
    alt,
    artbot_id,
    image_id,
    height,
    width,
    onAspectRatioCalculated
  }: ImageThumbnailV2Props) => {
    const [imageUrl, setImageUrl] = useState(defaultImage)
    const imgRef = useRef<HTMLImageElement>(null)

    const calculateAspectRatio = useCallback(() => {
      if (
        imgRef.current &&
        imgRef.current.naturalWidth &&
        imgRef.current.naturalHeight
      ) {
        const aspectRatio =
          imgRef.current.naturalWidth / imgRef.current.naturalHeight
        onAspectRatioCalculated?.(aspectRatio)
      }
    }, [onAspectRatioCalculated])

    useEffect(() => {
      let isMounted = true

      const fetchImage = async () => {
        let dexieImage

        if (image_id) {
          dexieImage = await checkImageExistsInDexie({ image_id })
        }

        if (
          dexieImage &&
          dexieImage !== true &&
          'imageBlob' in dexieImage &&
          dexieImage.imageBlob &&
          isMounted
        ) {
          const url = URL.createObjectURL(dexieImage.imageBlob)
          setImageUrl(url)
        }
      }

      fetchImage()

      return () => {
        isMounted = false

        if (imageUrl !== defaultImage) {
          URL.revokeObjectURL(imageUrl)
        }
      }
    }, [artbot_id, image_id])

    useEffect(() => {
      if (imgRef.current) {
        if (imgRef.current.complete) {
          calculateAspectRatio()
        } else {
          imgRef.current.addEventListener('load', calculateAspectRatio)
        }
      }

      return () => {
        imgRef.current?.removeEventListener('load', calculateAspectRatio)
      }
    }, [calculateAspectRatio])

    return (
      <img
        ref={imgRef}
        className="object-cover w-full h-full"
        alt={alt}
        src={imageUrl}
        width={width}
        height={height}
        style={{
          maxHeight: `${height}px`,
          maxWidth: `${width}px`
        }}
      />
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.artbot_id === nextProps.artbot_id &&
      prevProps.image_id === nextProps.image_id
    )
  }
)

ImageThumbnailV2.displayName = 'ImageThumbnailV2'
export default ImageThumbnailV2
