'use client'

import ImageViewImage from './ImageViewImage'
import styles from './imageView.module.css'
import { ImageViewProvider } from './ImageViewProvider'
import ImageViewInfoContainer from './ImageViewInfoContainer'

export default function ImageView({
  artbot_id,
  image_id,
  onDelete = () => {},
  showPendingPanel = false,
  singleImage = false
}: {
  artbot_id: string
  image_id?: string
  onDelete?: () => void
  showPendingPanel?: boolean
  singleImage?: boolean
}) {
  return (
    <ImageViewProvider
      artbot_id={artbot_id}
      image_id={image_id as string}
      singleImage={singleImage}
    >
      <div className="mt-[24px]">
        <div className={styles.ImageViewer}>
          <ImageViewImage />
          <ImageViewInfoContainer
            showPendingPanel={showPendingPanel}
            onDelete={onDelete}
          />
        </div>
      </div>
    </ImageViewProvider>
  )
}
