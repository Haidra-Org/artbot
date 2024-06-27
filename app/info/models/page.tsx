import PageTitle from '@/app/_components/PageTitle'
import ModelsInfo from './_component/ModelsInfo'
import { getModelsData } from '@/app/_api/models'

export default async function ModelsPage() {
  const { modelsAvailable, modelDetails } = await getModelsData()

  return (
    <div className="col">
      <PageTitle>Model Details</PageTitle>
      <ModelsInfo
        modelsAvailable={modelsAvailable}
        modelDetails={modelDetails}
      />
    </div>
  )
}
