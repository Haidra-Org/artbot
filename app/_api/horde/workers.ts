import { AppConstants } from '@/app/_data-models/AppConstants'
import { clientHeader } from '@/app/_data-models/ClientHeader'
import { HordeWorker } from '@/app/_types/HordeTypes'

// Cache and timestamp initialization
let workersCache: HordeWorker[] = []
let lastFetchTime = 0

export const fetchHordeWorkers = async () => {
  const currentTime = new Date().getTime()

  // Check if the last fetch was less than a minute ago
  if (currentTime - lastFetchTime < 60000 && workersCache.length > 0) {
    return workersCache // Return the cached data
  }

  try {
    const res = await fetch(
      `${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        },
        method: 'GET'
      }
    )

    const data = await res.json()

    if (Array.isArray(data)) {
      // Filter for image workers only:
      const filtered = data.filter((worker) => worker.type === 'image')

      // Update the cache and timestamp
      workersCache = filtered
      lastFetchTime = currentTime
    } else {
      if (workersCache.length > 0) {
        return workersCache
      }

      return []
    }
  } catch (err) {
    console.log(`Error: Unable to fetch worker details from AI Horde`)
    console.log(err)

    if (workersCache.length > 0) {
      return workersCache
    }

    return []
  }

  // We should probably never get here, yeah?
  return workersCache
}
