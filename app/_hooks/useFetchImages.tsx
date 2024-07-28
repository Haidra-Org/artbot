'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useStore } from 'statery'
import { AppStore } from '../_stores/AppStore'
import {
  GalleryStore,
  setGalleryCurrentPage,
  setGalleryGroupImages,
  setGallerySortBy
} from '../_stores/GalleryStore'
import {
  countAllImagesForCompletedJobsFromDexie,
  countCompletedJobsFromDexie,
  fetchAllImagesForCompletedJobsFromDexie,
  fetchCompletedJobsFromDexie
} from '@/app/_db/hordeJobs'

const LIMIT = 20

export interface ImageFile {
  artbot_id: string
  image_id: string
  width: number
  height: number
  image_count: number
}

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
  initLoad: boolean
  images: PhotoData[]
  totalImages: number
  fetchImages: () => void
}

const mapToPhotoData = (data: ImageFile[]): PhotoData[] => {
  return data.map((image) => ({
    artbot_id: image.artbot_id,
    image_id: image.image_id,
    key: `image-${image.image_id}`,
    src: '',
    image_count: image.image_count || 1,
    width: image.width,
    height: image.height
  }))
}

export default function useFetchImages(): FetchImagesResult {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { currentPage, groupImages, sortBy } = useStore(GalleryStore)
  const { online } = useStore(AppStore)
  const [initLoad, setInitLoad] = useState(true)
  const [images, setImages] = useState<PhotoData[]>([])
  const [totalImages, setTotalImages] = useState(0)
  const [initialSyncComplete, setInitialSyncComplete] = useState(false)

  // Calculate offset based on current page
  const offset = currentPage * LIMIT

  // Fetch images based on current state values
  const fetchImages = useCallback(async () => {
    let data: ImageFile[] = []
    let count: number = 0

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

    const imagesArray = mapToPhotoData(data)

    setTotalImages(count)
    setImages(imagesArray)
    setInitLoad(false)
  }, [groupImages, offset, sortBy])

  // Initial sync effect to set the state from URL parameters
  useEffect(() => {
    const query = new URLSearchParams(searchParams)
    const page = Number(query.get('page') || 1) - 1
    const group = query.get('group') !== 'false'
    const sort = (query.get('sortBy') as 'asc' | 'desc') || 'desc'

    if (currentPage !== page) {
      setGalleryCurrentPage(page)
    }
    if (groupImages !== group) {
      setGalleryGroupImages(group)
    }
    if (sortBy !== sort) {
      setGallerySortBy(sort)
    }

    setInitialSyncComplete(true)
    // Adding anything besides "searchParams" breaks ability to filter images based on URL params
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Effect to update URL when store changes
  useEffect(() => {
    if (
      pathname === '/images' &&
      currentPage === 0 &&
      sortBy === 'desc' &&
      groupImages
    ) {
      return
    }

    if (initialSyncComplete && online) {
      const query = new URLSearchParams()
      query.set('page', (currentPage + 1).toString())
      query.set('sortBy', sortBy)
      query.set('group', groupImages.toString())
      router.push(`${pathname}?${query.toString()}`)
    }
  }, [
    currentPage,
    groupImages,
    sortBy,
    initialSyncComplete,
    online,
    router,
    pathname
  ])

  // Effect to fetch images when dependencies change
  useEffect(() => {
    if (initialSyncComplete) {
      fetchImages()
    }
  }, [fetchImages, initialSyncComplete])

  // Effect to handle browser back button navigation
  useEffect(() => {
    const handlePopState = () => {
      const query = new URLSearchParams(window.location.search)
      const page = Number(query.get('page') || 1) - 1
      const group = query.get('group') !== 'false'
      const sort = (query.get('sortBy') as 'asc' | 'desc') || 'desc'

      if (currentPage !== page) {
        setGalleryCurrentPage(page)
      }
      if (groupImages !== group) {
        setGalleryGroupImages(group)
      }
      if (sortBy !== sort) {
        setGallerySortBy(sort)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [currentPage, groupImages, sortBy])

  return {
    initLoad,
    images,
    totalImages,
    fetchImages
  }
}
