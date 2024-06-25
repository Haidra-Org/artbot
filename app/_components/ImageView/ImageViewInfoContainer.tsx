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
import { useState } from 'react'
import { formatStylePresetPrompt } from '@/app/_utils/stringUtils'

export default function ImageViewInfoContainer({
  onDelete
}: {
  onDelete: () => void
}) {
  const [showPromptPreset, setShowPromptPreset] = useState(false)
  const { currentImageId, imageData, imageId } = useImageView()
  const [imageDetails] = useImageDetails(currentImageId || imageId)
  const { imageRequest } = imageData

  return (
    <div className={styles.ImageInfoContainer}>
      <div className="row w-full justify-center">
        <ImageViewActions onDelete={onDelete} />
      </div>
      <div className="col gap-1 w-full">
        <div className="row gap-2 text-sm font-bold">
          <IconPlaylistAdd stroke={1} />
          Prompt
        </div>
        <div className="w-full text-sm ml-[8px] break-words">
          {!showPromptPreset
            ? imageRequest?.prompt
            : formatStylePresetPrompt({
                positive: imageRequest?.prompt,
                negative: imageRequest?.negative,
                stylePresetPrompt: imageRequest.preset[0].settings.prompt
              })}
        </div>
      </div>
      {imageRequest?.preset && imageRequest.preset.length > 0 && (
        <div>
          <div
            className="primary-color text-sm cursor-pointer row font-mono"
            onClick={() => setShowPromptPreset(!showPromptPreset)}
          >
            [ {showPromptPreset ? 'Hide' : 'Show'} modified prompt ]
          </div>
        </div>
      )}
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
