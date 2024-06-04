import { makeStore } from 'statery'

interface ImageStoreInterface {
  fullscreenImageId: string | null
}

export const ImageStore = makeStore<ImageStoreInterface>({
  fullscreenImageId: null
})

export const setFullscreenImageId = (image_id: string | null) => {
  ImageStore.set(() => ({ fullscreenImageId: image_id }))
}
