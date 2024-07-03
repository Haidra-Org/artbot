'use client'

import NiceModal from '@ebay/nice-modal-react'
import PhotoAlbum from 'react-photo-album'
import React, { useCallback, useEffect } from 'react'
import ReactPaginate from 'react-paginate'
import {
  IconAffiliate,
  IconAffiliateFilled,
  IconChevronRight,
  IconCircleCheck,
  // IconSearch,
  IconSettings,
  IconSortAscending,
  IconSortDescending
} from '@tabler/icons-react'

import useFetchImages, { PhotoData } from '../_hooks/useFetchImages'
import ImageView from './ImageView'
import Button from './Button'
import ImageThumbnail from './ImageThumbnail'
import GalleryImageCardOverlay from './GalleryImageCardOverlay'
import { viewedPendingPage } from '../_stores/PendingImagesStore'
import Section from './Section'

export default function Gallery() {
  // const [showSearch, setShowSearch] = useState(false)

  const {
    currentPage,
    fetchImages,
    groupImages,
    images,
    initLoad,
    setCurrentPage,
    setGroupImages,
    // setSearchInput,
    setSortBy,
    sortBy,
    totalImages
  } = useFetchImages()

  const handleImageOpen = useCallback(
    (artbot_id: string, image_id?: string) => {
      NiceModal.show('modal', {
        children: (
          <ImageView
            artbot_id={artbot_id}
            image_id={!groupImages ? image_id : undefined}
            onDelete={fetchImages}
          />
        ),
        modalStyle: {
          maxWidth: '1536px',
          width: 'calc(100% - 32px)'
        }
      })
    },
    [fetchImages, groupImages]
  )

  const handleImageKeypress = (
    e: React.KeyboardEvent,
    artbot_id: string,
    image_id?: string
  ) => {
    // Check if Enter or Space was pressed
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleImageOpen(artbot_id, image_id)
    }
  }

  // On initial load of the gallery page, let's go ahead and reset viewed completed images to 0, since they should appear here.
  useEffect(() => {
    viewedPendingPage()
  }, [])

  return (
    <div className="w-full">
      <Section className="w-full mb-2">
        <div className="row w-full justify-between">
          <div className="row">
            {/* <Button
              onClick={() => {
                if (showSearch) {
                  setSearchInput('')
                  setShowSearch(false)
                } else {
                  setShowSearch(true)
                }
              }}
            >
              <span className="row gap-1">
                <IconSearch stroke={1.5} size={16} />
                Search
              </span>
            </Button> */}
            <Button
              onClick={() => {
                setCurrentPage(0)
                setGroupImages(!groupImages)
              }}
              title="Group or ungroup images by batched image request"
            >
              <span className="row gap-1 justify-center md:w-[5.75em]">
                {groupImages ? (
                  <>
                    <IconAffiliate />
                    <span className="hidden sm:row">Ungroup</span>
                  </>
                ) : (
                  <>
                    <IconAffiliateFilled stroke={1.5} size={16} />
                    <span className="hidden sm:row">Group</span>
                  </>
                )}
              </span>
            </Button>
            <Button
              onClick={() => setSortBy(sortBy === 'desc' ? 'asc' : 'desc')}
            >
              <span className="row gap-1">
                {sortBy === 'desc' ? (
                  <IconSortDescending stroke={1.5} size={20} />
                ) : (
                  <IconSortAscending stroke={1.5} size={20} />
                )}
                <span className="hidden sm:row">Sort</span>
              </span>
            </Button>
            {/* <Menu
            menuText={
              <span className="row">
                <IconFilter stroke={1.5} size={20} />
                <span className="hidden sm:row">Filter</span>
              </span>
            }
          >
            <MenuItem>All images</MenuItem>
            <MenuItem>Favorited</MenuItem>
            <MenuItem>Unfavorited</MenuItem>
          </Menu> */}
            <Button onClick={() => {}}>
              <span className="row gap-1">
                <IconSettings stroke={1.5} size={20} />
                <span className="hidden sm:row">
                  Settings
                  <IconChevronRight />
                </span>
              </span>
            </Button>
          </div>
          <div>
            <Button onClick={() => {}}>
              <span className="row gap-1">
                <IconCircleCheck stroke={1.5} size={20} />
                <span className="hidden sm:row">
                  Select
                  <IconChevronRight />
                </span>
              </span>
            </Button>
          </div>
        </div>
      </Section>
      <div className="w-full font-mono text-xs mb-2">
        Page {currentPage + 1} of {Math.ceil(totalImages / 20)} ({totalImages}{' '}
        {groupImages ? 'image requests' : 'total images'})
      </div>
      {/* {showSearch && <ImageSearch setSearchInput={setSearchInput} />} */}
      {images.length > 0 && (
        <>
          <PhotoAlbum
            layout="rows"
            spacing={4}
            photos={images}
            renderPhoto={(renderPhotoProps) => {
              const { layout, imageProps } = renderPhotoProps || {}

              const { photo }: { photo: PhotoData } = renderPhotoProps || {}
              const { alt } = imageProps || {}

              return (
                <div
                  key={photo.artbot_id}
                  style={{
                    alignItems: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    height: layout.height,
                    justifyContent: 'center',
                    // marginBottom: layoutOptions.spacing, // Use for "masonry" layout
                    marginBottom: 0, // Use for "rows" layout
                    position: 'relative',
                    width: layout.width
                  }}
                  tabIndex={0}
                  onClick={() => {
                    handleImageOpen(photo.artbot_id, photo.image_id)
                  }}
                  onKeyDown={(e) =>
                    handleImageKeypress(e, photo.artbot_id, photo.image_id)
                  }
                >
                  {groupImages && (
                    <ImageThumbnail alt={alt} artbot_id={photo.artbot_id} />
                  )}
                  {!groupImages && (
                    <ImageThumbnail alt={alt} image_id={photo.image_id} />
                  )}
                  <GalleryImageCardOverlay
                    imageCount={photo.image_count}
                    style={{
                      height:
                        photo.height > layout.height
                          ? layout.height
                          : photo.height,
                      width:
                        photo.width > layout.width ? layout.width : photo.width
                    }}
                  />
                </div>
              )
            }}
            rowConstraints={(containerWidth) => {
              let minPhotos = 2

              if (containerWidth >= 768) {
                minPhotos = 3
              } else if (containerWidth >= 1024) {
                minPhotos = 4
              } else if (containerWidth >= 1280) {
                minPhotos = 5
              }

              return {
                minPhotos,
                maxPhotos: 5,
                singleRowMaxHeight: 256
              }
            }}
          />
          {!initLoad && (
            <div className="row justify-center my-2 mt-4">
              <ReactPaginate
                breakLabel="..."
                nextLabel="⇢"
                forcePage={currentPage}
                onPageChange={(val) => {
                  setCurrentPage(Number(val.selected))
                  window.scrollTo(0, 0)
                }}
                containerClassName="row gap-0"
                breakLinkClassName="border px-3 py-2 bg-[#8ac5d1] hover:bg-[#8ac5d1] text-white"
                pageLinkClassName="border px-3 py-2 bg-[#6AB7C6] hover:bg-[#8ac5d1] text-white"
                previousLinkClassName="rounded-l-md border px-3 py-2 bg-[#6AB7C6] hover:bg-[#8ac5d1] text-white"
                nextLinkClassName="rounded-r-md border px-3 py-2 bg-[#6AB7C6] hover:bg-[#8ac5d1] text-white"
                disabledLinkClassName="bg-[#969696] hover:bg-[#969696] cursor-default text-white"
                pageRangeDisplayed={3}
                pageCount={Math.ceil(totalImages / 20)}
                previousLabel="⇠"
                renderOnZeroPageCount={null}
              />
            </div>
          )}
        </>
      )}
      {images.length === 0 && !initLoad && (
        <div className="text-center text-2xl">No results found</div>
      )}
    </div>
  )
}
