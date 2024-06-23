import AppInitComponent from './AppInitComponent'

export async function getData() {
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/Haidra-Org/AI-Horde-image-model-reference/main/stable_diffusion.json`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'GET'
      }
    )

    const data = await res.json()

    // Parse json to ensure validity
    const jsonString = JSON.stringify(data)
    const json = JSON.parse(jsonString)

    // Optional: Additional checks to ensure the JSON structure is as expected
    if (!json || typeof json !== 'object' || Object.keys(json).length === 0) {
      return {
        modelDetails: {}
      }
    }

    return {
      modelDetails: data
    }
  } catch (error) {
    return {
      modelDetails: {}
    }
  }
}

export default async function AppInit() {
  const { modelDetails } = await getData()
  return <AppInitComponent modelDetails={modelDetails} />
}
