import { useCallback, useEffect, useState } from 'react'
import { getImageDetailsFromDexie } from '../_db/jobTransactions'
import { ImageFileInterface } from '../_data-models/ImageFile_Dexie'
import { HordeJob, ImageRequest } from '../_types/ArtbotTypes'

export interface JobDetails {
  jobDetails: HordeJob
  imageFile: ImageFileInterface
  imageRequest: ImageRequest
}

export default function useImageDetails(image_id: string) {
  const [imageDetails, setImageDetails] = useState<JobDetails>()

  const fetchImageDetails = useCallback(async () => {
    if (!image_id) return

    const data = await getImageDetailsFromDexie(image_id)
    if (!data) return
    setImageDetails(data as JobDetails)
  }, [image_id])

  useEffect(() => {
    fetchImageDetails()
  }, [fetchImageDetails, image_id])

  return [imageDetails]
}
