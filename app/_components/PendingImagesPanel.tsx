/* eslint-disable @next/next/no-img-element */
'use client'

// import PhotoAlbum from 'react-photo-album'
import { useStore } from 'statery'
// import { PendingImagesStore } from '@/app/_store/PendingImagesStore'
import { useCallback, useEffect, useState } from 'react'
// import { fetchCompletedJobsByArtbotIdsFromDexie } from '@/app/_db/hordeJobs'
// import Image from './Image'
import NiceModal from '@ebay/nice-modal-react'
import { JobStatus } from '../_types/ArtbotTypes'
// import ImageViewer from '@/app/_components/modules/ImageViewer/imageViewer'
// import PendingImageOverlay from './PendingImageOverlay/pendingImageOverlay'

interface PhotoData {
  artbot_id: string
  key: string
  src: string
  hordeStatus: JobStatus
  image_count: number
  width: number
  height: number
}

export default function PendingImagesPanel() {
  const { pendingImages } = useStore(PendingImagesStore)
  const [images, setImages] = useState<PhotoData[]>([])

  const fetchImages = useCallback(async () => {
    const artbotIds = pendingImages.map((image) => image.artbot_id)
    const data = await fetchCompletedJobsByArtbotIdsFromDexie(artbotIds)

    const imagesArray = data.map((image) => {
      return {
        artbot_id: image.artbot_id,
        image_id: image.image_id,
        key: `image-${image.image_id}`,
        src: '', // PhotoAlbum library requires this but we're not using it.
        image_count: image.image_count || 1,
        hordeStatus: image.status,
        width: image.width,
        height: image.height
      }
    }) as unknown as PhotoData[]

    setImages(imagesArray)
  }, [pendingImages])

  useEffect(() => {
    fetchImages()
  }, [fetchImages, pendingImages])

  if (images.length === 0) {
    return <div>Try creating an image!</div>
  }

  return (
    <PhotoAlbum
      layout="masonry"
      // photos={photos}
      spacing={4}
      photos={images}
      renderPhoto={(renderPhotoProps) => {
        const { layout, layoutOptions, photo, imageProps } =
          renderPhotoProps || {}
        const { alt, style, ...restImageProps } = imageProps || {}

        // @ts-expect-error Deleting this due to using custom image component.
        delete restImageProps.src

        if (photo.hordeStatus !== JobStatus.Done) {
          return (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                height: layout.height,
                width: layout.width,
                marginBottom: layoutOptions.spacing
              }}
            >
              <img
                alt={alt}
                style={{
                  ...style,
                  borderRadius: '8px',
                  width: '100%',
                  height: 'auto',
                  marginBottom: '0 !important'
                }}
                {...restImageProps}
                src="data:image/gif;base64,R0lGODdhAQABAJEAAAAAAB8fH////wAAACH5BAkAAAMALAAAAAABAAEAAAICTAEAOw=="
              />
              <PendingImageOverlay
                artbot_id={photo.artbot_id}
                status={photo.hordeStatus}
              />
            </div>
          )
        } else {
          return (
            <div
              key={photo.artbot_id}
              style={{
                alignItems: 'center',
                cursor: 'pointer',
                display: 'flex',
                height: layout.height,
                justifyContent: 'center',
                marginBottom: layoutOptions.spacing,
                position: 'relative',
                width: layout.width
              }}
              onClick={() => {
                NiceModal.show('modal', {
                  children: <ImageViewer artbot_id={photo.artbot_id} />
                })
              }}
            >
              <Image alt={alt} artbot_id={photo.artbot_id} />
              <PendingImageOverlay
                artbot_id={photo.artbot_id}
                imageCount={photo.image_count}
                status={photo.hordeStatus}
              />
            </div>
          )
        }
      }}
      targetRowHeight={256}
      rowConstraints={{
        singleRowMaxHeight: 256
      }}
      columns={(containerWidth) => {
        if (containerWidth < 512) return 1
        if (containerWidth < 800) return 2
        if (containerWidth < 1200) return 3
        if (containerWidth < 1600) return 4
        return 5
      }}
    />
  )
}
