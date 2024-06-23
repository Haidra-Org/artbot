import { makeStore } from 'statery'
import { ImageModelDetails } from '../_types/HordeTypes'

interface ModelStoreInterface {
  modelDetails: {
    [key: string]: ImageModelDetails
  }
}

export const ModelStore = makeStore<ModelStoreInterface>({
  modelDetails: {}
})

export const setImageModels = (modelDetails: {
  [key: string]: ImageModelDetails
}) => {
  ModelStore.set(() => ({ modelDetails }))
}
