import { getModelsData } from '@/app/_api/models'
import AppInitComponent from './AppInitComponent'
import { Suspense } from 'react'

export default async function AppInit() {
  const { modelsAvailable, modelDetails } = await getModelsData()
  return (
    <Suspense fallback={null}>
      <AppInitComponent
        modelsAvailable={modelsAvailable}
        modelDetails={modelDetails}
      />
    </Suspense>
  )
}
