import { makeStore } from 'statery'

interface GalleryStoreInterface {
  currentPage: number
  groupImages: boolean
  sortBy: 'asc' | 'desc'
}

export const GalleryStore = makeStore<GalleryStoreInterface>({
  currentPage: 0,
  groupImages: true,
  sortBy: 'desc'
})

export const setGalleryCurrentPage = (update: number) => {
  GalleryStore.set((s) => ({ ...s, currentPage: update }))
}

export const setGalleryGroupImages = (update: boolean) => {
  GalleryStore.set((s) => ({ ...s, groupImages: update }))
}

export const setGallerySortBy = (update: 'asc' | 'desc') => {
  GalleryStore.set((s) => ({ ...s, sortBy: update }))
}
