import { makeStore } from 'statery'

interface GalleryStoreInterface {
  currentPage: number
  groupImages: boolean
  showFavorites: 'all' | 'favs' | 'non-favs'
  sortBy: 'asc' | 'desc'
}

export const GalleryStore = makeStore<GalleryStoreInterface>({
  currentPage: 0,
  groupImages: true,
  showFavorites: 'all',
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

export const setGalleryShowFavorites = (
  update: 'all' | 'favs' | 'non-favs'
) => {
  GalleryStore.set((s) => ({ ...s, showFavorites: update }))
}
