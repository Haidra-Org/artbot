import { AvailableImageModel } from '@/app/_types/HordeTypes'
import ModelSelectComponent from './modelSelectComponentV2'
import models from './models.json'
import { clientHeader } from '@/app/_data-models/ClientHeader'

export async function getData() {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Simple request so I don't hit a Horde rate limit
      console.log(`!! DEV MODE: Fetching models from local models.json file.`)
      const data = models

      const filtered = data
        .filter((model: AvailableImageModel) => model.type === 'image')
        .sort(
          (a: AvailableImageModel, b: AvailableImageModel) => b.count - a.count
        )

      return {
        success: true,
        models: filtered
      }
    }

    const res = await fetch(`https://aihorde.net/api/v2/status/models`, {
      headers: {
        // apikey: apikey,
        'Client-Agent': clientHeader(),
        'Content-Type': 'application/json'
      },
      next: { revalidate: 60 } // Revalidate every 60 seconds
    })

    const data = (await res.json()) || {}

    const filtered = data
      .filter((model: AvailableImageModel) => model.type === 'image')
      .sort(
        (a: AvailableImageModel, b: AvailableImageModel) => b.count - a.count
      )

    return {
      success: true,
      models: filtered
    }
  } catch (err) {
    console.log(err)
    return {
      success: false,
      models: []
    }
  }
}

export default async function ModelSelect() {
  // const data = await getData()
  return (
    <ModelSelectComponent
    // hasError={data.success === false}
    // models={data.models}
    />
  )
}
