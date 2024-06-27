import { getModelsData } from '@/app/_api/models'
import AppInitComponent from './AppInitComponent'

export default async function AppInit() {
  const { modelsAvailable, modelDetails } = await getModelsData()
  return (
    <AppInitComponent
      modelsAvailable={modelsAvailable}
      modelDetails={modelDetails}
    />
  )
}
