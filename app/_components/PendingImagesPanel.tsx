/* eslint-disable @next/next/no-img-element */
'use client'

import PhotoAlbum from 'react-photo-album'
import { useStore } from 'statery'
import { useCallback, useEffect, useState } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import {
  IconAffiliate,
  IconClearAll,
  IconFilter,
  IconPhotoBolt,
  IconSettings,
  IconSortDescending
} from '@tabler/icons-react'

import { fetchCompletedJobsByArtbotIdsFromDexie } from '../_db/hordeJobs'
import { JobStatus } from '../_types/ArtbotTypes'
import { PendingImagesStore } from '../_stores/PendingImagesStore'
import ImageThumbnail from './ImageThumbnail'
import PendingImageOverlay from './PendingImageOverlay'
import ImageView from './ImageView'
import Section from './Section'
import Button from './Button'
import PendingImageView from './ImageView_Pending'
import PendingImagePanelStats from './PendingImagePanelStats'

interface PendingImagesPanelProps {
  showBorder?: boolean
  showTitle?: boolean
}

interface PhotoData {
  artbot_id: string
  key: string
  src: string
  hordeStatus: JobStatus
  image_count: number
  error: boolean
  width: number
  height: number
}

export default function PendingImagesPanel({
  showBorder = true,
  showTitle = true
}: PendingImagesPanelProps) {
  const { pendingImages } = useStore(PendingImagesStore)
  const [images, setImages] = useState<PhotoData[]>([])

  const fetchImages = useCallback(async () => {
    const artbotIds = pendingImages.map((image) => image.artbot_id)
    const data = await fetchCompletedJobsByArtbotIdsFromDexie(artbotIds)

    const imagesArray = data.map((image) => {
      return {
        artbot_id: image.artbot_id,
        image_id: image.image_id,
        key: `image-${image.artbot_id || image.image_id}`,
        src: '', // PhotoAlbum library requires this but we're not using it.
        image_count: image.image_count || 1,
        error: image.images_requested === image.images_failed,
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
      className="w-full rounded-md p-2 col min-h-[364px] relative"
      style={{ border: showBorder ? '1px solid #7e5a6c' : 'none' }}
    >
      {showTitle && (
        <h2 className="row font-bold">
          <IconPhotoBolt />
          Pending images
        </h2>
      )}
      <Section className="justify-end gap-2 row z-10 sticky top-[42px]">
        <Button onClick={() => {}} style={{ width: '42px' }}>
          <IconClearAll />
        </Button>
        <Button onClick={() => {}} style={{ width: '42px' }}>
          <IconAffiliate />
        </Button>
        <Button onClick={() => {}} style={{ width: '42px' }}>
          <IconSortDescending />
        </Button>
        <Button onClick={() => {}} style={{ width: '42px' }}>
          <IconFilter />
        </Button>
        <Button onClick={() => {}} style={{ width: '42px' }}>
          <IconSettings />
        </Button>
      </Section>
      <PendingImagePanelStats />
      {images.length === 0 && (
        <div className="absolute top-0 left-0 right-0 bottom-0 col justify-center z-[1]">
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
                key={photo.artbot_id}
                onClick={() => {
                  NiceModal.show('modal', {
                    children: <PendingImageView artbot_id={photo.artbot_id} />,
                    modalClassName: 'w-full md:min-w-[640px] max-w-[768px]'
                  })
                }}
                style={{
                  alignItems: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  height: layout.height,
                  justifyContent: 'center',
                  marginBottom: layoutOptions.spacing,
                  position: 'relative',
                  width: layout.width,
                  backgroundImage: 'url(/tile.png)',
                  backgroundSize: 'auto',
                  backgroundRepeat: 'repeat',
                  boxShadow: 'inset 0px 0px 70px -3px rgba(0,0,0,0.8)'
                }}
              >
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
                onClick={() => {
                  // TODO: Better way to handle / triage error states.)
                  if (photo.error) {
                    NiceModal.show('modal', {
                      children: (
                        <PendingImageView artbot_id={photo.artbot_id} />
                      ),
                      modalClassName: 'w-full md:min-w-[640px] max-w-[768px]'
                    })
                  } else {
                    NiceModal.show('modal', {
                      children: <ImageView artbot_id={photo.artbot_id} />
                    })
                  }
                }}
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
