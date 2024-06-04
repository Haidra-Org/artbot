/* eslint-disable @next/next/no-img-element */
'use client'

import PhotoAlbum from 'react-photo-album'
import { useStore } from 'statery'
import { useCallback, useEffect, useState } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import { IconPhotoBolt } from '@tabler/icons-react'

import { fetchCompletedJobsByArtbotIdsFromDexie } from '../_db/hordeJobs'
import { JobStatus } from '../_types/ArtbotTypes'
import { PendingImagesStore } from '../_stores/PendingImagesStore'
import ImageThumbnail from './ImageThumbnail'
import PendingImageOverlay from './PendingImageOverlay'
import ImageViewer from './ImageView'
// import ImageViewer from '@/app/_components/modules/ImageViewer/imageViewer'

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

  return (
    <div
      className="w-full rounded-md p-2 hidden md:col min-h-[364px] relative"
      style={{ border: '1px solid #7e5a6c' }}
    >
      <h2 className="row font-bold">
        <IconPhotoBolt />
        Pending images
      </h2>
      {images.length === 0 && (
        <div className="absolute top-0 left-0 right-0 bottom-0 col justify-center">
          <p className="text-gray-400 w-full text-center  ">
            No pending images. Create something new!
          </p>
        </div>
      )}
      <PhotoAlbum
        layout="masonry"
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
                    // children: <ImageViewer artbot_id={photo.artbot_id} />
                  })
                }}
              >
                <ImageThumbnail alt={alt} artbot_id={photo.artbot_id} />
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
          if (containerWidth <= 512) return 1
          if (containerWidth <= 800) return 2
          if (containerWidth <= 1200) return 3
          if (containerWidth <= 1600) return 4
          return 5
        }}
      />
    </div>
  )
}
