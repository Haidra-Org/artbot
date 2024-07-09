import { ImageFileInterface } from '@/app/_data-models/ImageFile_Dexie'
import { getSourceImagesForArtbotJobFromDexie } from '@/app/_db/ImageFiles'
import { JobDetails } from '@/app/_hooks/useImageDetails'
import { useEffect, useState } from 'react'
import ImageThumbnail from '../ImageThumbnail'
import { IconPhotoUp } from '@tabler/icons-react'

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
    <div className="col gap-2 w-full mt-4">
      <div className="row gap-2 text-sm font-bold">
        <IconPhotoUp stroke={1} />
        Source image
      </div>
      <ImageThumbnail image_id={srcImages[0]?.image_id} alt="Source Image" />
    </div>
  )
}
