import { clientHeader } from '@/app/_data-models/ClientHeader'
import AppInitComponent from './AppInitComponent'
import { AvailableImageModel } from '@/app/_types/HordeTypes'

export async function getData() {
  try {
    const availableUrl = `https://aihorde.net/api/v2/status/models`
    const detailsUrl = `https://raw.githubusercontent.com/Haidra-Org/AI-Horde-image-model-reference/main/stable_diffusion.json`

    const [availableRes, detailsRes] = await Promise.allSettled([
      fetch(availableUrl, {
        headers: {
          'Client-Agent': clientHeader(),
          'Content-Type': 'application/json'
        },
        next: { revalidate: 120 } // Revalidate every 120 seconds
      }),
      fetch(detailsUrl, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'GET'
      })
    ])

    const availableData =
      availableRes.status === 'fulfilled' ? await availableRes.value.json() : []
    const detailsData =
      detailsRes.status === 'fulfilled' ? await detailsRes.value.json() : {}

    const availableFiltered = availableData
      .filter((model: AvailableImageModel) => model.type === 'image')
      .sort(
        (a: AvailableImageModel, b: AvailableImageModel) => b.count - a.count
      )

    // Parse json to ensure validity
    const jsonString = JSON.stringify(detailsData)
    const json = JSON.parse(jsonString)

    // Optional: Additional checks to ensure the JSON structure is as expected
    if (!json || typeof json !== 'object' || Object.keys(json).length === 0) {
      return {
        modelsAvailable: [],
        modelDetails: {}
      }
    }

    return {
      modelsAvailable: availableFiltered,
      modelDetails: detailsData
    }
  } catch (error) {
    return {
      modelsAvailable: [],
      modelDetails: {}
    }
  }
}

export default async function AppInit() {
  const { modelsAvailable, modelDetails } = await getData()
  return (
    <AppInitComponent
      modelsAvailable={modelsAvailable}
      modelDetails={modelDetails}
    />
  )
}
