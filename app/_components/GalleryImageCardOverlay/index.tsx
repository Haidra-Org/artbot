import { IconLibraryPhoto } from '@tabler/icons-react'
import styles from './galleryImageCardOverlay.module.css'
import { CSSProperties } from 'react'

export default function GalleryImageCardOverlay({
  imageCount,
  style
}: {
  imageCount: number
  style?: CSSProperties
}) {
  return (
    <div className={styles.ImageCardOverlay} style={{ ...style }}>
      {imageCount > 1 && (
        <div className={styles.ImageCount}>
          <IconLibraryPhoto stroke={1.5} />
          {imageCount}
        </div>
      )}
    </div>
  )
}
