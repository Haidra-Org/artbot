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

export default function ImageViewActions({
  onDelete
}: {
  onDelete: () => void
}) {
  const { artbot_id, imageId } = useImageView()
  const [rerollImage] = useRerollImage()
  const [isFavorite, toggleFavorite] = useFavorite(artbot_id, imageId as string)

  return (
    <div className="row w-full justify-center">
      <div className="row w-full justify-between max-w-[388px]">
        <Button onClick={() => {}} outline>
          <IconDotsCircleHorizontal stroke={1} />
        </Button>
        <Button onClick={() => {}} outline>
          <IconCopy stroke={1} />
        </Button>
        <Button onClick={() => {}} outline>
          <IconShare stroke={1} />
        </Button>
        <Button
          onClick={() => setFullscreenImageId(imageId as string)}
          outline
          title="Expand image to full browser window"
        >
          <IconWindowMaximize stroke={1} />
        </Button>
        <Button onClick={() => {}} outline>
          <IconDownload stroke={1} />
        </Button>
        <Button
          onClick={() => {
            rerollImage(artbot_id)
          }}
          outline
        >
          <IconRefresh stroke={1} />
        </Button>
        <Button
          onClick={toggleFavorite}
          outline
          title={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
        >
          {isFavorite ? (
            <IconHeartFilled fill="red" stroke={1} />
          ) : (
            <IconHeart stroke={1} />
          )}
        </Button>
        <Button
          onClick={async () => {
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
          }}
          title="Delete image"
          theme="danger"
          //
        >
          <IconTrash stroke={1} />
        </Button>
      </div>
    </div>
  )
}
