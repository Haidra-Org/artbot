/* eslint-disable @next/next/no-img-element */
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
import { deleteImageFromDexie } from '@/app/_db/jobTransactions'
import { useCallback, useEffect, useState } from 'react'
import Section from '../Section'
import DropdownMenu from '../DropdownMenu'
import { MenuDivider, MenuItem } from '@szhsin/react-menu'
import useImageBlobUrl from '@/app/_hooks/useImageBlobUrl'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'
import { compressAndEncode, getBaseUrl } from '@/app/_utils/urlUtils'
import { toastController } from '@/app/_controllers/toastController'
import { blobToClipboard } from '@/app/_utils/imageUtils'

export default function ImageViewActions({
  onDelete
}: {
  onDelete: () => void
}) {
  const showFullScreen = useFullScreenHandle()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { artbot_id, imageBlob, imageId, imageData } = useImageView()
  const imageUrl = useImageBlobUrl(imageBlob)
  const [rerollImage] = useRerollImage()
  const [isFavorite, toggleFavorite] = useFavorite(artbot_id, imageId as string)

  const handleDelete = useCallback(async () => {
    NiceModal.show('delete', {
      children: (
        <DeleteConfirmation
          onDelete={async () => {
            await deleteImageFromDexie(imageId as string)
            await onDelete()

            // For now, just close modal on delete
            NiceModal.remove('modal')
          }}
        />
      )
    })
  }, [imageId, onDelete])

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
          >
            <img
              className="max-h-screen max-w-full"
              src={imageUrl}
              alt="image"
            />
          </div>
        )}
      </FullScreen>
      <Section>
        <div className="row w-full justify-between max-w-[388px]">
          <Button onClick={() => {}} style={{ height: '38px', width: '38px' }}>
            <IconDotsCircleHorizontal stroke={1} />
          </Button>
          <DropdownMenu
            menuButton={
              <Button
                as="div"
                onClick={() => {}}
                style={{ height: '38px', width: '38px' }}
              >
                <IconCopy stroke={1} />
              </Button>
            }
          >
            <MenuItem>Use prompt</MenuItem>
            <MenuItem>Use all settings</MenuItem>
            <MenuDivider />
            <MenuItem>Copy JSON parameters</MenuItem>
            <MenuItem
              onClick={async () => {
                const success = await blobToClipboard(imageBlob as Blob)
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
                onClick={() => {}}
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
          <Button onClick={() => {}} style={{ height: '38px', width: '38px' }}>
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
          <Button
            onClick={handleDelete}
            title="Delete image"
            theme="danger"
            style={{ height: '38px', width: '38px' }}
          >
            <IconTrash stroke={1} />
          </Button>
        </div>
      </Section>
    </>
  )
}
