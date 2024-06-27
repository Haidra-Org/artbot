import { makeStore } from 'statery'
import { AvailableImageModel, ImageModelDetails } from '../_types/HordeTypes'

interface ModelStoreInterface {
  availableModels: AvailableImageModel[]
  modelDetails: {
    [key: string]: ImageModelDetails
  }
}

export const ModelStore = makeStore<ModelStoreInterface>({
  availableModels: [],
  modelDetails: {}
})

export const setAvailableModels = (models: AvailableImageModel[]) => {
  ModelStore.set(() => ({ availableModels: models }))
}

export const setImageModels = (modelDetails: {
  [key: string]: ImageModelDetails
}) => {
  ModelStore.set(() => ({ modelDetails }))
}
