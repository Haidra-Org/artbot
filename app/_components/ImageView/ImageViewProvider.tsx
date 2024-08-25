import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob'
import {
  ImageBlobBuffer,
  ImageFileInterface
} from '@/app/_data-models/ImageFile_Dexie'
import { getImagesForJobFromDexie } from '@/app/_db/jobTransactions'
import { ImageRequest } from '@/app/_types/ArtbotTypes'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react'

export interface ImageDetails {
  jobDetails: ArtBotHordeJob
  imageFiles: ImageFileInterface[]
  imageRequest: ImageRequest
}

interface DefaultContext {
  artbot_id: string
  currentImageId: string
  imageBlobBuffer: ImageBlobBuffer | undefined
  imageData: ImageDetails
  imageId: string
  setCurrentImageId: (image_id: string) => void
  getPrevImage: () => void
  getNextImage: () => void
}

const defaultContext: DefaultContext = {
  artbot_id: '',
  currentImageId: '',
  imageBlobBuffer: undefined,
  imageData: {
    jobDetails: {} as ArtBotHordeJob,
    imageFiles: [] as ImageFileInterface[],
    imageRequest: {} as ImageRequest
  },
  imageId: '' as string,
  setCurrentImageId: () => {},
  getPrevImage: () => {},
  getNextImage: () => {}
}

const ImageViewContext = createContext(defaultContext)

export const useImageView = () => {
  return useContext(ImageViewContext)
}

export const ImageViewProvider = ({
  artbot_id,
  children,
  image_id,
  singleImage = false
}: {
  artbot_id: string
  children: React.ReactNode
  image_id?: string
  singleImage?: boolean
}) => {
  const [imageBlobBuffer, setImageBlobBuffer] = useState<ImageBlobBuffer>()
  const [imageData, setImageData] = useState<ImageDetails>({
    jobDetails: {} as ArtBotHordeJob,
    imageFiles: [] as ImageFileInterface[],
    imageRequest: {} as ImageRequest
  })
  const [imageId, setImageId] = useState(image_id || '')
  const [currentImageId, setCurrentImageId] = useState(image_id || '')

  const fetchData = useCallback(async () => {
    try {
      let imageId = currentImageId
      const data = await getImagesForJobFromDexie(artbot_id)
      if (!data) return

      if (singleImage && imageId) {
        data.imageFiles = data.imageFiles.filter(
          (image) => image.image_id === imageId
        )
      }

      if (!imageId && 'image_id' in data.imageFiles[0]) {
        imageId = data.imageFiles[0].image_id
        setImageId(data.imageFiles[0].image_id)
      }

      const blobBuffer = data.imageFiles.find(
        (image) => image.image_id === imageId
      )?.imageBlobBuffer

      if (!blobBuffer) return

      setImageBlobBuffer(blobBuffer)
      setImageData(data as ImageDetails)
    } catch (err) {
      console.error('ImageViewProvider - Error fetching data:', err)
    }
  }, [artbot_id, currentImageId, singleImage])

  useEffect(() => {
    fetchData()
  }, [artbot_id, fetchData, image_id])

  const getPrevImage = useCallback(() => {
    const currentIndex = imageData.imageFiles.findIndex(
      (image) => image.image_id === currentImageId
    )
    const prevIndex =
      (currentIndex - 1 + imageData.imageFiles.length) %
      imageData.imageFiles.length
    const prevImageId = imageData.imageFiles[prevIndex].image_id
    setCurrentImageId(prevImageId)
  }, [currentImageId, imageData.imageFiles])

  const getNextImage = useCallback(() => {
    const currentIndex = imageData.imageFiles.findIndex(
      (image) => image.image_id === currentImageId
    )
    const nextIndex = (currentIndex + 1) % imageData.imageFiles.length
    const nextImageId = imageData.imageFiles[nextIndex].image_id
    setCurrentImageId(nextImageId)
  }, [currentImageId, imageData.imageFiles])

  return (
    <ImageViewContext.Provider
      value={{
        artbot_id,
        currentImageId,
        imageBlobBuffer,
        imageData,
        imageId,
        setCurrentImageId,
        getPrevImage,
        getNextImage
      }}
    >
      {children}
    </ImageViewContext.Provider>
  )
}
