'use client'

/* eslint-disable @next/next/no-img-element */
import { useSwipeable } from 'react-swipeable'
import {
  IconCopy,
  IconDotsCircleHorizontal,
  IconDownload,
  IconHeart,
  IconHeartFilled,
  IconRefresh,
  IconShare,
  IconTrash,
  IconWindowMaximize
} from '@tabler/icons-react'
import Button from '@/app/_components/Button'
import NiceModal from '@ebay/nice-modal-react'
import DeleteConfirmation from '../Modal_DeleteConfirmation'
import { useImageView } from './ImageViewProvider'
import useFavorite from '@/app/_hooks/useFavorite'
import useRerollImage from '@/app/_hooks/useRerollImage'
import { deleteImageFromDexie, deleteJobFromDexie } from '@/app/_db/jobTransactions'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Section from '../Section'
import DropdownMenu from '../DropdownMenu'
import { MenuDivider, MenuItem } from '@szhsin/react-menu'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { compressAndEncode, getBaseUrl } from '@/app/_utils/urlUtils'
import { toastController } from '@/app/_controllers/toastController'
import { blobToClipboard, bufferToBlob } from '@/app/_utils/imageUtils'
import { useRouter } from 'next/navigation'
import { cleanImageRequestForReuse } from '@/app/_utils/inputUtils'
import {
  cloneImageRowsInDexie,
  deleteImageFileByArtbotIdTx
} from '@/app/_db/ImageFiles'
import { AppConstants } from '@/app/_data-models/AppConstants'
import { ImageBlobBuffer, ImageType } from '@/app/_data-models/ImageFile_Dexie'
import Image from '../Image'
import { sleep } from '@/app/_utils/sleep'

function ImageViewActions({
  currentImageId,
  onDelete
}: {
  currentImageId: string
  onDelete: () => void
}) {
  const router = useRouter()

  const showFullScreen = useFullScreenHandle()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const {
    artbot_id,
    imageBlobBuffer,
    imageId,
    imageData,
    getNextImage,
    getPrevImage,
    singleImage
  } = useImageView()
  const { imageFiles } = imageData

  const [rerollImage] = useRerollImage()
  const [isFavorite, toggleFavorite] = useFavorite(artbot_id, imageId as string)

  const handlers = useSwipeable({
    onSwipedRight: () => {
      getPrevImage()
    },
    onSwipedLeft: () => {
      getNextImage()
    },
    preventScrollOnSwipe: true,
    swipeDuration: 250,
    trackTouch: true,
    delta: 35
  })

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('./downloadImageWorker.ts', import.meta.url),
      { type: 'module' }
    )

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const handleDelete = useCallback(async ({ deleteAll = false } = {} as { deleteAll?: boolean }) => {
    NiceModal.show('delete', {
      children: (
        <DeleteConfirmation
          deleteButtonTitle={deleteAll ? `Delete ${imageFiles.length} images` : 'Delete this image'}
          title={deleteAll ? 'Delete *all* images?' : 'Delete this image?'}
          message={
            <>
              <p>
                Are you sure you want to delete {deleteAll ? `*ALL* images in this batch? (${imageFiles.length} images)` : 'this image?'}
              </p>
              <p>This cannot be undone.</p>
            </>
          }
          onDelete={async () => {
            if (!deleteAll) {
              await deleteImageFromDexie(currentImageId as string || imageId as string)
              await onDelete()
            } else {
              await deleteJobFromDexie(artbot_id)
              await onDelete()
            }

            NiceModal.remove('modal')
          }}
        />
      )
    })
  }, [currentImageId, imageFiles, imageId, onDelete, artbot_id])

  const downloadImage = useCallback(
    async (image: Blob) => {
      const { saveAs } = (await import('file-saver')).default

      const filename =
        imageData.imageRequest.prompt
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .slice(0, 120) + `.png`

      saveAs(image, filename)
    },
    [imageData.imageRequest.prompt]
  )

  const handleDownload = useCallback(
    async (imageBlobBuffer: ImageBlobBuffer | null, metadata: object) => {
      if (!imageBlobBuffer || !workerRef.current) {
        return
      }

      const imageBlob = bufferToBlob(imageBlobBuffer)

      return new Promise<void>((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'))
          return
        }

        workerRef.current.onmessage = (e: MessageEvent) => {
          if (e.data.pngBlob) {
            downloadImage(e.data.pngBlob)
            resolve()
          } else if (e.data.error) {
            console.error('Worker error:', e.data.error)
            reject(new Error(e.data.error))
          }
        }

        workerRef.current.postMessage({ imageBlob, metadata })
      })
    },
    [downloadImage]
  )

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Delete') {
        handleDelete()
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyPress)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleDelete])

  return (
    <>
      <FullScreen
        handle={showFullScreen}
        onChange={(isFullscreen) => setIsFullscreen(isFullscreen)}
      >
        {isFullscreen && (
          <div
            className="flex flex-row items-center justify-center w-full h-screen"
            onClick={() => {
              showFullScreen.exit()
            }}
            {...handlers}
          >
            <Image
              className="max-h-screen max-w-full"
              imageBlobBuffer={imageBlobBuffer}
              alt="image"
            />
          </div>
        )}
      </FullScreen>
      <Section>
        <div className="row w-full justify-between max-w-[388px]">
          <Button onClick={() => { }} style={{ height: '38px', width: '38px' }}>
            <IconDotsCircleHorizontal stroke={1} />
          </Button>
          <DropdownMenu
            menuButton={
              <Button
                as="div"
                onClick={() => { }}
                style={{ height: '38px', width: '38px' }}
              >
                <IconCopy stroke={1} />
              </Button>
            }
          >
            <MenuItem>Use prompt</MenuItem>
            <MenuItem
              onClick={async () => {
                const { imageRequest } = imageData
                const updatedImageRequest = cleanImageRequestForReuse(
                  imageRequest,
                  { keepSeed: true }
                )

                const jsonString = JSON.stringify(updatedImageRequest)
                sessionStorage.setItem('userInput', jsonString)

                await deleteImageFileByArtbotIdTx(
                  AppConstants.IMAGE_UPLOAD_TEMP_ID
                )

                await cloneImageRowsInDexie(
                  imageRequest.artbot_id,
                  AppConstants.IMAGE_UPLOAD_TEMP_ID,
                  ImageType.SOURCE
                )

                NiceModal.remove('modal')

                // Why sleep here?
                // The Modal component disabled pop state so that a back click triggers a modal close.
                // As such, that will disable the ability to push to a new page.
                // Waiting for a moment prevents that.
                await sleep(100)
                router.push('/create')
              }}
            >
              Use all settings
            </MenuItem>
            <MenuDivider />
            <MenuItem>Copy JSON parameters</MenuItem>
            <MenuItem
              onClick={async () => {
                if (!imageBlobBuffer) return

                const success = await blobToClipboard(imageBlobBuffer)
                if (success) {
                  toastController({
                    message: 'Image copied to clipboard!'
                  })
                }
              }}
            >
              Copy image to clipboard
            </MenuItem>
          </DropdownMenu>
          <DropdownMenu
            menuButton={
              <Button
                as="div"
                onClick={() => { }}
                style={{ height: '38px', width: '38px' }}
              >
                <IconShare stroke={1} />
              </Button>
            }
          >
            <MenuItem>Share image (creates URL)</MenuItem>
            <MenuItem
              onClick={() => {
                const encodedData = compressAndEncode(imageData.imageRequest)
                const url = `${getBaseUrl()}/create#share=${encodeURIComponent(encodedData)}`

                navigator.clipboard.writeText(url)
                toastController({
                  message: 'URL copied to clipboard!'
                })
              }}
            >
              Share parameters (creates URL)
            </MenuItem>
            <MenuDivider />
            <MenuItem>Submit to ArtBot showcase</MenuItem>
          </DropdownMenu>

          <Button
            onClick={() => {
              setIsFullscreen(true)
              showFullScreen.enter()
            }}
            title="Expand image to full browser window"
            style={{ height: '38px', width: '38px' }}
          >
            <IconWindowMaximize stroke={1} />
          </Button>
          <Button
            onClick={() => {
              const comment: string =
                `${imageData.imageRequest.prompt}\n` +
                (imageData.imageRequest.negative
                  ? `Negative prompt: ${imageData.imageRequest.negative}\n`
                  : ``) +
                `Steps: ${imageData.imageRequest.steps}, Sampler: ${imageData.imageRequest.sampler}, CFG scale: ${imageData.imageRequest.cfg_scale}, Seed: ${imageData.imageRequest.seed}` +
                `, Size: ${imageData.imageRequest.width}x${imageData.imageRequest.height}, model: ${imageData.imageRequest.models}`

              const metaData = {
                Comment: comment
              }

              handleDownload(imageBlobBuffer as ImageBlobBuffer, metaData)
            }}
            style={{ height: '38px', width: '38px' }}
          >
            <IconDownload stroke={1} />
          </Button>
          <Button
            onClick={() => {
              rerollImage(artbot_id)
            }}
            style={{ height: '38px', width: '38px' }}
          >
            <IconRefresh stroke={1} />
          </Button>
          <Button
            onClick={toggleFavorite}
            title={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
            style={{ height: '38px', width: '38px' }}
          >
            {isFavorite ? (
              <IconHeartFilled fill="red" stroke={1} />
            ) : (
              <IconHeart stroke={1} />
            )}
          </Button>
          {(singleImage || imageFiles.length === 1) && (
            <Button
              onClick={handleDelete}
              title="Delete image"
              theme="danger"
              style={{ height: '38px', width: '38px' }}
            >
              <IconTrash stroke={1} />
            </Button>
          )}
          {(!singleImage && imageFiles.length > 1) && (
            <DropdownMenu
              menuButton={
                <Button
                  as="div"
                  title="Delete image"
                  theme="danger"
                  onClick={() => handleDelete}
                  style={{ height: '38px', width: '38px' }}
                >
                  <IconTrash stroke={1} />
                </Button>
              }
            >
              <MenuItem
                onClick={() => {
                  handleDelete({ deleteAll: false })
                }}
              >Delete this image</MenuItem>
              <MenuItem
                onClick={() => {
                  handleDelete({ deleteAll: true })
                }}
              >
                Delete ALL images in batch
              </MenuItem>
            </DropdownMenu>
          )}
        </div>
      </Section>
    </>
  )
}

export default React.memo(ImageViewActions, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return prevProps.currentImageId === nextProps.currentImageId
})
