import {
  IconPlaylistAdd,
  IconPlaylistX,
  IconSettings
} from '@tabler/icons-react'
import ImageViewActions from './imageViewActions'
import styles from './imageView.module.css'

import { useImageView } from './ImageViewProvider'
import ImageDetails from '../ImageDetails'
import useImageDetails, { JobDetails } from '@/app/_hooks/useImageDetails'

export default function ImageViewInfoContainer({
  onDelete
}: {
  onDelete: () => void
}) {
  const { imageData, imageId } = useImageView()
  const [imageDetails] = useImageDetails(imageId)
  const { imageRequest } = imageData

  return (
    <div className={styles.ImageInfoContainer}>
      <ImageViewActions onDelete={onDelete} />
      <div className="col gap-1 w-full">
        <div className="row gap-2 text-sm font-bold">
          <IconPlaylistAdd stroke={1} />
          Prompt
        </div>
        <div className="w-full text-sm ml-[8px] break-words">
          {imageRequest?.prompt}
        </div>
      </div>
      {imageRequest?.negative && (
        <div className="col gap-0 w-full">
          <div className="row gap-2 text-sm font-bold">
            <IconPlaylistX stroke={1} />
            Negative
          </div>
          <div className="w-full text-sm ml-[8px] break-words">
            {imageRequest?.negative}
          </div>
        </div>
      )}
      <div className="col gap-2 w-full">
        <div className="row gap-2 text-sm font-bold">
          <IconSettings stroke={1} />
          Image details
        </div>
        <ImageDetails imageDetails={imageDetails as JobDetails} />
      </div>
    </div>
  )
}
