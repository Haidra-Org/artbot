import {
  countAllImagesForCompletedJobsFromDexie,
  countCompletedJobsFromDexie,
  fetchAllImagesForCompletedJobsFromDexie,
  fetchCompletedJobsFromDexie
} from '@/app/_db/hordeJobs'
import { searchPromptsFromDexie } from '@/app/_db/promptsHistory'
import { debounce } from '@/app/_utils/debounce'
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from 'react'

const LIMIT = 20

export interface PhotoData {
  artbot_id: string
  image_id: string
  key: string
  src: string
  width: number
  height: number
  image_count: number
}

export interface FetchImagesResult {
  images: PhotoData[]
  totalImages: number
  fetchImages: () => void
  setSearchInput: Dispatch<SetStateAction<string>>
  initLoad: boolean
}

export default function useFetchImages({
  currentPage,
  groupImages,
  sortBy = 'desc'
}: {
  currentPage: number
  groupImages: boolean
  sortBy: 'asc' | 'desc'
}): FetchImagesResult {
  // Handle initial load of page
  // so we don't flash "No Images Found" if images actually exist.
  const [initLoad, setInitLoad] = useState(true)

  // Track internal state of groupImages so we can reset offset and currentPage to 0 if groupImages changes
  const [groupImagesState, setGroupImagesState] = useState(groupImages)

  const [offset, setOffset] = useState(0)
  const [totalImages, setTotalImages] = useState(0)
  const [images, setImages] = useState<PhotoData[]>([])
  const [searchInput, setSearchInput] = useState('')

  const fetchSearchResults = useCallback(async () => {
    const data = await searchPromptsFromDexie({
      searchInput,
      sortDirection: sortBy
    })

    const imagesArray = data.map((image) => {
      return {
        artbot_id: image.artbot_id,
        image_id: image.image_id,
        key: `image-${image.image_id}`,
        src: '', // PhotoAlbum library requires this but we're not using it.
        image_count: image.image_count || 1,
        width: image.width,
        height: image.height
      }
    }) as unknown as PhotoData[]

    setTotalImages(imagesArray.length)
    setImages(imagesArray)
  }, [searchInput, sortBy])

  const fetchImages = useCallback(async () => {
    let data = []
    let count = 0
    let updateOffset = offset

    if (groupImages !== groupImagesState) {
      updateOffset = 0
      setOffset(0)
      setGroupImagesState(groupImages)
    }

    if (groupImages) {
      count = await countCompletedJobsFromDexie()
      data = await fetchCompletedJobsFromDexie(LIMIT, updateOffset, sortBy)
    } else {
      count = await countAllImagesForCompletedJobsFromDexie()
      data = await fetchAllImagesForCompletedJobsFromDexie(
        LIMIT,
        updateOffset,
        sortBy
      )
    }

    const imagesArray = data.map((image) => {
      return {
        artbot_id: image.artbot_id,
        image_id: image.image_id,
        key: `image-${image.image_id}`,
        src: '', // PhotoAlbum library requires this but we're not using it.
        image_count: image.image_count || 1,
        width: image.width,
        height: image.height
      }
    }) as unknown as PhotoData[]

    setTotalImages(count)
    setImages(imagesArray)
    setInitLoad(false)
  }, [groupImages, groupImagesState, offset, sortBy])

  useEffect(() => {
    if (searchInput) {
      fetchSearchResults()
    } else {
      fetchImages()
    }
  }, [fetchImages, fetchSearchResults, searchInput])

  useEffect(() => {
    setOffset(currentPage * LIMIT)
  }, [currentPage])

  const debounceSearchInput = debounce(setSearchInput, 250)

  return {
    images,
    totalImages,
    fetchImages,
    setSearchInput: debounceSearchInput,
    initLoad
  }
}
