'use client'

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { checkImageExistsInDexie } from '../_db/ImageFiles'
import { bufferToBlob } from '../_utils/imageUtils'
import { ImageBlobBuffer } from '../_data-models/ImageFile_Dexie'

const defaultImage =
  'data:image/gif;base64,R0lGODdhAQABAJEAAAAAAB8fH////wAAACH5BAkAAAMALAAAAAABAAEAAAICTAEAOw=='

const ImageThumbnail = ({
  alt,
  artbot_id,
  image_id
}: {
  alt: string
  artbot_id?: string
  image_id?: string
}) => {
  // State to store the image URL, initialized with a default placeholder
  const [imageUrl, setImageUrl] = useState(defaultImage)

  // Ref to track whether the image has been loaded successfully
  const imageLoaded = useRef(false)

  // useCallback to memoize the fetchImage function, preventing unnecessary re-renders
  const fetchImage = async ({
    artbot_id,
    image_id
  }: {
    artbot_id?: string
    image_id?: string
  }) => {
    // Check if the image has already been loaded to avoid redundant fetches
    if (imageLoaded.current) return

    let dexieImage
    // Fetch the image from IndexedDB based on artbot_id or image_id
    if (artbot_id) {
      dexieImage = await checkImageExistsInDexie({ artbot_id })
    } else if (image_id) {
      dexieImage = await checkImageExistsInDexie({ image_id })
    }

    // If the image is found in IndexedDB, convert it to a blob and create a URL
    if (
      dexieImage &&
      dexieImage !== true &&
      'imageBlobBuffer' in dexieImage &&
      dexieImage.imageBlobBuffer
    ) {
      const blob = bufferToBlob(dexieImage.imageBlobBuffer as ImageBlobBuffer)
      const url = URL.createObjectURL(blob)
      setImageUrl(url) // Update the image URL state
      imageLoaded.current = true // Mark the image as loaded
    }
  }

  // useEffect to fetch the image when the component mounts and clean up URL object when unmounts
  useEffect(() => {
    fetchImage({
      artbot_id,
      image_id
    })

    // Clean up the object URL when the component unmounts to avoid memory leaks
    return () => {
      if (imageUrl !== defaultImage) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [artbot_id, imageUrl, image_id])

  // Render the <img> element with the retrieved or default image URL and the provided alt text
  return <img alt={alt} src={imageUrl} />
}

export default ImageThumbnail
