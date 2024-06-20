import {
  IconAlertTriangle,
  IconCheck,
  IconLoader,
  IconUpload
} from '@tabler/icons-react'
import { useStore } from 'statery'
import { PendingImagesStore } from '../_stores/PendingImagesStore'

export default function PendingImagePanelStats() {
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
      className="row justify-between p-1"
      style={{
        border: '1px solid rgb(63 63 70)',
        borderRadius: '4px'
      }}
    >
      <div className="row text-[12px]" title="Images completed">
        <IconCheck size={16} stroke={1.5} />
        {done.length}
      </div>
      <div className="row text-[12px]" title="Images processings">
        <IconLoader size={16} stroke={1.5} />
        {processing.length}
      </div>
      <div className="row text-[12px]" title="Images queued">
        <IconUpload size={16} stroke={1.5} />
        {waiting.length}
      </div>
      <div className="row text-[12px]" title="Images failed">
        <IconAlertTriangle size={16} stroke={1.5} />
        {error.length}
      </div>
    </div>
  )
}
