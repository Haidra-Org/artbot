'use client'

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react'
import { checkImageExistsInDexie } from '../_db/ImageFiles'
import { bufferToBlob } from '../_utils/imageUtils'
import { ImageBlobBuffer } from '../_data-models/ImageFile_Dexie'

const defaultImage =
  'data:image/gif;base64,R0lGODdhAQABAJEAAAAAAB8fH////wAAACH5BAkAAAMALAAAAAABAAEAAAICTAEAOw=='

// Memoized Image Component
// Prevents re-rendering of the same image multiple times as parent is updated
const ImageThumbnail = React.memo(
  ({
    alt,
    artbot_id,
    image_id
  }: {
    alt: string
    artbot_id?: string
    image_id?: string
  }) => {
    const [imageUrl, setImageUrl] = useState(defaultImage)

    useEffect(() => {
      let isMounted = true // To prevent state update on unmounted component

      const fetchImage = async () => {
        let dexieImage

        if (artbot_id) {
          dexieImage = await checkImageExistsInDexie({ artbot_id })
        } else if (image_id) {
          dexieImage = await checkImageExistsInDexie({ image_id })
        }

        if (
          dexieImage &&
          dexieImage !== true &&
          'imageBlobBuffer' in dexieImage &&
          dexieImage.imageBlobBuffer &&
          isMounted
        ) {
          if (!dexieImage.imageBlobBuffer) return

          const blob = bufferToBlob(
            dexieImage.imageBlobBuffer as ImageBlobBuffer
          )
          const url = URL.createObjectURL(blob)
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
    }, [artbot_id])

    return <img alt={alt} src={imageUrl} />
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    return prevProps.artbot_id === nextProps.artbot_id
  }
)

ImageThumbnail.displayName = 'ImageThumbnail'
export default ImageThumbnail
