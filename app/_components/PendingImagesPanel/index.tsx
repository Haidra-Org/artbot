/* eslint-disable @next/next/no-img-element */
'use client'

import PhotoAlbum from 'react-photo-album'
import { useStore } from 'statery'
import { useCallback, useEffect, useRef, useState } from 'react'
import NiceModal from '@ebay/nice-modal-react'
import {
  IconPhotoBolt,
  IconSortAscending,
  IconSortDescending
} from '@tabler/icons-react'

import { fetchCompletedJobsByArtbotIdsFromDexie } from '../../_db/hordeJobs'
import { JobStatus } from '../../_types/ArtbotTypes'
import { PendingImagesStore } from '../../_stores/PendingImagesStore'
import ImageThumbnail from '../ImageThumbnail'
import PendingImageOverlay from '../PendingImageOverlay'
import ImageView from '../ImageView'
import Section from '../Section'
import Button from '../Button'
import PendingImageView from '../ImageView_Pending'
import PendingImagePanelStats from '../PendingImagePanelStats'
import FilterButton from './PendingImagesPanel_FilterButton'
import ClearButton from './PendingImagesPanel_ClearButton'
import { appBasepath } from '@/app/_utils/browserUtils'

interface PendingImagesPanelProps {
  scrollContainer?: boolean
  showBorder?: boolean
  showTitle?: boolean
}

interface PhotoData {
  artbot_id: string
  image_id: string
  key: string
  src: string
  hordeStatus: JobStatus
  image_count: number
  error: boolean
  width: number
  height: number
}

export default function PendingImagesPanel({
  scrollContainer = true,
  showBorder = true,
  showTitle = true
}: PendingImagesPanelProps) {
  const topDivRef = useRef(null)
  const scrollableDivRef = useRef(null)
  const [topOffset, setTopOffset] = useState(178)
  const [minHeight, setMinHeight] = useState('100vh')

  const { pendingImages } = useStore(PendingImagesStore)
  const [images, setImages] = useState<PhotoData[]>([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc')

  const fetchImages = useCallback(async () => {
    // Fetch the completed jobs data
    const artbotIds = pendingImages.map((image) => image.artbot_id)
    const data = await fetchCompletedJobsByArtbotIdsFromDexie(artbotIds)

    // Create a lookup object for completed jobs by artbot_id
    const completedJobsById = data.reduce(
      (acc, image) => {
        acc[image.artbot_id] = image
        return acc
      },
      {} as Record<string, (typeof data)[0]>
    )

    // Iterate through the pendingImages array
    const imagesArray = pendingImages.map((pendingImage, idx) => {
      const completedImage = completedJobsById[pendingImage.artbot_id]
      if (completedImage) {
        return {
          artbot_id: completedImage.artbot_id,
          image_id: completedImage.image_id,
          key: `image-${completedImage.artbot_id || completedImage.image_id}`,
          src: '', // PhotoAlbum library requires this but we're not using it.
          image_count: completedImage.image_count || 1,
          error:
            completedImage.images_requested === completedImage.images_failed,
          hordeStatus: completedImage.status,
          width: completedImage.width,
          height: completedImage.height
        }
      } else {
        return {
          artbot_id: pendingImage.artbot_id,
          image_id: 'completedImage.image_id_' + idx,
          key: `image-${pendingImage.artbot_id}`,
          src: '', // PhotoAlbum library requires this but we're not using it.
          image_count: pendingImage.images_requested || 1,
          error: pendingImage.images_requested === pendingImage.images_failed,
          hordeStatus: pendingImage.status,
          width: pendingImage.width,
          height: pendingImage.height
        }
      }
    }) as PhotoData[]

    if (sortBy === 'asc') {
      imagesArray.reverse()
    }

    // Update the state with the resulting array
    setImages(imagesArray)
  }, [pendingImages, sortBy])

  useEffect(() => {
    fetchImages()
  }, [fetchImages, pendingImages])

  useEffect(() => {
    setImages((prevImages) => {
      const sortedImages = [...prevImages]
      if (sortBy === 'asc') {
        sortedImages.reverse()
      }
      return sortedImages
    })
  }, [sortBy])

  useEffect(() => {
    const updateMinHeight = () => {
      if (typeof window !== 'undefined') {
        setMinHeight(`${window.innerHeight - 92}px`)
      }
    }

    updateMinHeight()

    window.addEventListener('resize', updateMinHeight)

    return () => window.removeEventListener('resize', updateMinHeight)
  }, [])

  const updateTopOffset = () => {
    if (topDivRef.current) {
      // @ts-expect-error Au contraire, it does!
      const topDivHeight = topDivRef.current.offsetHeight
      setTopOffset(topDivHeight + 8) // Adding a margin if needed
    }
  }

  useEffect(() => {
    updateTopOffset()
    window.addEventListener('resize', updateTopOffset)
    return () => {
      window.removeEventListener('resize', updateTopOffset)
    }
  }, [])

  const filteredImages = images.filter((image) => {
    const { hordeStatus } = image
    if (filter === 'all') {
      return true
    } else if (filter === 'done') {
      return hordeStatus === JobStatus.Done
    } else if (filter === 'processing') {
      return hordeStatus === JobStatus.Processing
    } else if (filter === 'error') {
      return hordeStatus === JobStatus.Error
    } else if (filter === 'pending') {
      return (
        hordeStatus === JobStatus.Requested ||
        hordeStatus === JobStatus.Waiting ||
        hordeStatus === JobStatus.Queued
      )
    }
    return false
  })

  return (
    <div
      className="w-full rounded-md col min-h-[364px] relative p-2"
      style={{
        border: showBorder ? '1px solid #7e5a6c' : 'none',
        padding: showBorder ? '0.5rem' : '0',
        minHeight
      }}
    >
      {showTitle && (
        <h2 className="row font-bold">
          <IconPhotoBolt />
          Pending images
        </h2>
      )}
      <Section className="z-10 sticky top-[42px]">
        <div className="w-full justify-end gap-2 row">
          <ClearButton />
          <Button
            onClick={() => {
              setSortBy(sortBy === 'asc' ? 'desc' : 'asc')
            }}
            style={{ height: '38px', width: '38px' }}
          >
            {sortBy === 'asc' ? <IconSortAscending /> : <IconSortDescending />}
          </Button>
          <FilterButton filter={filter} setFilter={setFilter} />
        </div>
      </Section>
      <PendingImagePanelStats setFilter={setFilter} />
      <div className="w-full font-mono text-xs" ref={topDivRef}>
        Filter: {filter} ({filteredImages.length} image request
        {filteredImages.length !== 1 ? 's' : ''})
      </div>
      {images.length === 0 && (
        <div className="absolute top-0 left-0 right-0 bottom-0 col justify-center z-1">
          <p className="text-gray-400 w-full text-center  ">
            No pending images. Create something new!
          </p>
        </div>
      )}
      <div
        className={
          !scrollContainer
            ? ''
            : 'absolute left-[8px] right-0 bottom-[8px] col justify-start z-2 overflow-auto pr-[12px]'
        }
        ref={scrollableDivRef}
        style={{ top: `${topOffset + 152}px` }}
      >
        <PhotoAlbum
          layout="masonry"
          spacing={4}
          photos={filteredImages}
          renderPhoto={(renderPhotoProps) => {
            const { layout, layoutOptions, photo, imageProps } =
              renderPhotoProps || {}
            const { alt, ...restImageProps } = imageProps || {}



            // @ts-expect-error Deleting this due to using custom image component.
            delete restImageProps.src

            if (photo.hordeStatus !== JobStatus.Done) {
              return (
                <div
                  key={photo.image_id}
                  onClick={() => {
                    NiceModal.show('modal', {
                      children: (
                        <PendingImageView artbot_id={photo.artbot_id} />
                      ),
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
                    backgroundImage: `url(${appBasepath()}/tile.png)`,
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
                  key={photo.image_id}
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
                        children: (
                          <ImageView
                            artbot_id={photo.artbot_id}
                            showPendingPanel={true}
                          />
                        )
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
    </div>
  )
}
