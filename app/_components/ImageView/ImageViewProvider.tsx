import { ImageFileInterface } from '@/app/_data-models/ImageFile_Dexie'
import { getImagesForJobFromDexie } from '@/app/_db/jobTransactions'
import { HordeJob, ImageRequest } from '@/app/_types/ArtbotTypes'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

interface ImageDetails {
  jobDetails: HordeJob
  imageFiles: ImageFileInterface[]
  imageRequest: ImageRequest
}

interface DefaultContext {
  artbot_id: string
  currentImageId: string
  imageBlob: Blob | undefined
  imageData: ImageDetails
  imageId: string
  setCurrentImageId: (image_id: string) => void
}

const defaultContext: DefaultContext = {
  artbot_id: '',
  currentImageId: '',
  imageBlob: undefined,
  imageData: {
    jobDetails: {} as HordeJob,
    imageFiles: [] as ImageFileInterface[],
    imageRequest: {} as ImageRequest
  },
  imageId: '' as string,
  setCurrentImageId: () => {}
}

const ImageViewContext = createContext(defaultContext)

export const useImageView = () => {
  return useContext(ImageViewContext)
}

export const ImageViewProvider = ({
  artbot_id,
  children,
  image_id
}: {
  artbot_id: string
  children: React.ReactNode
  image_id?: string
}) => {
  const [imageBlob, setImageBlob] = useState<Blob>()
  const [imageData, setImageData] = useState<ImageDetails>({
    jobDetails: {} as HordeJob,
    imageFiles: [] as ImageFileInterface[],
    imageRequest: {} as ImageRequest
  })
  const [imageId, setImageId] = useState(image_id || '')
  const [currentImageId, setCurrentImageId] = useState(image_id || '')

  const fetchData = useCallback(async () => {
    try {
      const data = await getImagesForJobFromDexie(artbot_id)
      if (!data) return

      let imageId = currentImageId
      if (!currentImageId) {
        imageId = data.imageFiles[0].image_id
        setImageId(data.imageFiles[0].image_id)
      }

      const blob = data.imageFiles.find(
        (image) => image.image_id === imageId
      )?.imageBlob

      setImageBlob(blob as Blob)
      setImageData(data as ImageDetails)
    } catch (err) {
      console.error('ImageViewProvider - Error fetching data:', err)
    }
  }, [artbot_id, currentImageId])

  useEffect(() => {
    fetchData()
  }, [artbot_id, fetchData, image_id])

  return (
    <ImageViewContext.Provider
      value={{
        artbot_id,
        currentImageId,
        imageBlob,
        imageData,
        imageId,
        setCurrentImageId
      }}
    >
      {children}
    </ImageViewContext.Provider>
  )
}
