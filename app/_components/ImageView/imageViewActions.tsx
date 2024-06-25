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
import { setFullscreenImageId } from '@/app/_stores/ImageStore'
import NiceModal from '@ebay/nice-modal-react'
import DeleteConfirmation from '../Modal_DeleteConfirmation'
import { useImageView } from './ImageViewProvider'
import useFavorite from '@/app/_hooks/useFavorite'
import useRerollImage from '@/app/_hooks/useRerollImage'
import { deleteImageFromDexie } from '@/app/_db/jobTransactions'
import { useCallback, useEffect } from 'react'
import Section from '../Section'

export default function ImageViewActions({
  onDelete
}: {
  onDelete: () => void
}) {
  const { artbot_id, imageId } = useImageView()
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
    <Section>
      <div className="row w-full justify-between max-w-[388px]">
        <Button onClick={() => {}} style={{ height: '38px', width: '38px' }}>
          <IconDotsCircleHorizontal stroke={1} />
        </Button>
        <Button onClick={() => {}} style={{ height: '38px', width: '38px' }}>
          <IconCopy stroke={1} />
        </Button>
        <Button onClick={() => {}} style={{ height: '38px', width: '38px' }}>
          <IconShare stroke={1} />
        </Button>
        <Button
          onClick={() => setFullscreenImageId(imageId as string)}
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
  )
}
