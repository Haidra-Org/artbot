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

export default function useFetchImages({
  currentPage,
  groupImages,
  sortBy = 'desc'
}: {
  currentPage: number
  groupImages: boolean
  sortBy: 'asc' | 'desc'
}): [
  PhotoData[],
  number,
  () => void,
  Dispatch<SetStateAction<string>>,
  boolean
] {
  // Handle initial load of page
  // so we don't flash "No Images Found" if images actually exist.
  const [initLoad, setInitLoad] = useState(true)

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

    if (groupImages) {
      count = await countCompletedJobsFromDexie()
      data = await fetchCompletedJobsFromDexie(LIMIT, offset, sortBy)
    } else {
      count = await countAllImagesForCompletedJobsFromDexie()
      data = await fetchAllImagesForCompletedJobsFromDexie(
        LIMIT,
        offset,
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
  }, [groupImages, offset, sortBy])

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

  return [images, totalImages, fetchImages, debounceSearchInput, initLoad]
}
