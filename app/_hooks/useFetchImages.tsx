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
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useStore } from 'statery'
import { AppStore } from '../_stores/AppStore'

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
  currentPage: number
  setCurrentPage: Dispatch<SetStateAction<number>>
  groupImages: boolean
  setGroupImages: Dispatch<SetStateAction<boolean>>
  sortBy: 'asc' | 'desc'
  setSortBy: Dispatch<SetStateAction<'asc' | 'desc'>>
}

export default function useFetchImages(): FetchImagesResult {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { online } = useStore(AppStore)

  // Initialize state with query parameters or defaults
  const [initLoad, setInitLoad] = useState(true)
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get('page') || 1) - 1
  )
  const [groupImages, setGroupImages] = useState(
    searchParams.get('group') !== 'false'
  )
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>(
    (searchParams.get('sortBy') as 'asc' | 'desc') || 'desc'
  )
  const [offset, setOffset] = useState(0)
  const [totalImages, setTotalImages] = useState(0)
  const [images, setImages] = useState<PhotoData[]>([])
  const [searchInput, setSearchInput] = useState('')

  // Update the URL with current state values
  const updateUrl = useCallback(() => {
    // Do not push changes to URL if offline
    // as the query params break ServiceWorker caching.
    if (!online) {
      return
    }

    const query = new URLSearchParams()
    query.set('page', (currentPage + 1).toString()) // Set page as currentPage + 1
    query.set('sortBy', sortBy)
    query.set('group', groupImages.toString())
    router.push(`${pathname}?${query.toString()}`)
  }, [online, currentPage, sortBy, groupImages, router, pathname])

  useEffect(() => {
    if (!initLoad) {
      updateUrl()
    }
  }, [currentPage, groupImages, sortBy, updateUrl, initLoad])

  // Fetch search results from Dexie based on search input and sorting
  const fetchSearchResults = useCallback(async () => {
    const data = await searchPromptsFromDexie({
      searchInput,
      sortDirection: sortBy
    })

    const imagesArray = data.map((image) => ({
      artbot_id: image.artbot_id,
      image_id: image.image_id,
      key: `image-${image.image_id}`,
      src: '',
      image_count: image.image_count || 1,
      width: image.width,
      height: image.height
    })) as PhotoData[]

    setTotalImages(imagesArray.length)
    setImages(imagesArray)
  }, [searchInput, sortBy])

  // Fetch images based on current state values
  const fetchImages = useCallback(async () => {
    let data = []
    let count = 0
    const updateOffset = offset

    // if (groupImages !== groupImagesState) {
    //   updateOffset = 0
    //   setOffset(0)
    //   setGroupImagesState(groupImages)
    // }

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

    const imagesArray = data.map((image) => ({
      artbot_id: image.artbot_id,
      image_id: image.image_id,
      key: `image-${image.image_id}`,
      src: '',
      image_count: image.image_count || 1,
      width: image.width,
      height: image.height
    })) as PhotoData[]

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

  // Update state when URL query parameters change
  useEffect(() => {
    const page = Number(searchParams.get('page') || 1) - 1 // Read page as page - 1
    const group = searchParams.get('group') !== 'false'
    const sort = (searchParams.get('sortBy') as 'asc' | 'desc') || 'desc'

    if (currentPage !== page) setCurrentPage(page)
    if (groupImages !== group) setGroupImages(group)
    if (sortBy !== sort) setSortBy(sort)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return {
    images,
    totalImages,
    fetchImages,
    setSearchInput: debounceSearchInput,
    initLoad,
    currentPage,
    setCurrentPage,
    groupImages,
    setGroupImages,
    sortBy,
    setSortBy
  }
}
