import { ImageFileInterface } from '@/app/_data-models/ImageFile_Dexie'
import { getSourceImagesForArtbotJobFromDexie } from '@/app/_db/ImageFiles'
import { JobDetails } from '@/app/_hooks/useImageDetails'
import { useEffect, useState } from 'react'
import ImageThumbnail from '../ImageThumbnail'

export default function ImageViewSourceImage({
  imageDetails
}: {
  imageDetails: JobDetails
}) {
  const [srcImages, setSrcImages] = useState<ImageFileInterface[]>([])

  useEffect(() => {
    async function fetchSrcImages() {
      if (!imageDetails || !imageDetails?.jobDetails?.artbot_id) return
      const images = await getSourceImagesForArtbotJobFromDexie(
        imageDetails.jobDetails.artbot_id
      )
      setSrcImages(images)
    }

    fetchSrcImages()
  }, [imageDetails])

  if (srcImages.length === 0) return null

  return (
    <div>
      <ImageThumbnail image_id={srcImages[0]?.image_id} alt="Source Image" />
    </div>
  )
}
