import {
  IconAlertTriangle,
  IconCheck,
  IconLayout2,
  IconLoader,
  IconUpload
} from '@tabler/icons-react'
import { useStore } from 'statery'
import { PendingImagesStore } from '../_stores/PendingImagesStore'

export default function PendingImagePanelStats({
  setFilter
}: {
  setFilter: (filter: string) => void
}) {
  const { pendingImages } = useStore(PendingImagesStore)

  const done = pendingImages.filter((image) => {
    return (
      image.status === 'done' && image.images_requested !== image.images_failed
    )
  })

  const waiting = pendingImages.filter((image) => {
    return (
      image.status === 'waiting' ||
      image.status === 'queued' ||
      image.status === 'requested'
    )
  })
  const processing = pendingImages.filter(
    (image) => image.status === 'processing'
  )
  const error = pendingImages.filter((image) => {
    return (
      image.status === 'error' || image.images_requested === image.images_failed
    )
  })

  return (
    <div
      className="row justify-between p-2 font-mono"
      style={{
        border: '1px solid rgb(63 63 70)',
        borderRadius: '4px'
      }}
    >
      <div
        className="row text-[14px] cursor-pointer"
        title="Images completed"
        onClick={() => setFilter('done')}
      >
        <IconCheck size={16} stroke={1.5} />
        {done.length}
      </div>
      <div
        className="row text-[14px] cursor-pointer"
        title="Show images processing"
        onClick={() => setFilter('processing')}
      >
        <IconLoader size={16} stroke={1.5} />
        {processing.length}
      </div>
      <div
        className="row text-[14px] cursor-pointer"
        title="Show images queued"
        onClick={() => setFilter('pending')}
      >
        <IconUpload size={16} stroke={1.5} />
        {waiting.length}
      </div>
      <div
        className="row text-[14px] cursor-pointer"
        title="Show failed image requests"
        onClick={() => setFilter('error')}
      >
        <IconAlertTriangle size={16} stroke={1.5} />
        {error.length}
      </div>
      <div
        className="row text-[14px] cursor-pointer"
        title="Show all images"
        onClick={() => setFilter('all')}
      >
        <IconLayout2 size={16} stroke={1.5} />
        {pendingImages.length}
      </div>
    </div>
  )
}
