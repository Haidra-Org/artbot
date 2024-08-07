import { HordePerformance } from '@/app/_types/HordeTypes'
import { useEffect, useState } from 'react'

const CACHE_DURATION = 60000 // 1 minute in milliseconds
let cachedData: HordePerformance | null = null
let cacheTimestamp: number | null = null

export default function HordePerformanceModal() {
  const [loading, setLoading] = useState(true)
  const [perfState, setPerfState] = useState<HordePerformance | null>(null)

  useEffect(() => {
    async function fetchPerformance() {
      const isCacheValid =
        cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION

      if (cachedData && isCacheValid) {
        setPerfState(cachedData)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          'https://aihorde.net/api/v2/status/performance'
        )
        const data = await response.json()
        setPerfState(data)
        cachedData = data
        cacheTimestamp = Date.now()
      } catch (err) {
        console.error(err)
      }

      setLoading(false)
    }

    fetchPerformance()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="row font-bold">Horde Performance</h2>
        <div>Loading...</div>
      </div>
    )
  }

  if (!perfState) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="row font-bold">Horde Performance</h2>
        <div>Error loading Horde performance data. Try again later.</div>
      </div>
    )
  }

  let stepsPerRequest: number = 0
  let requestsPerMinute: number = 0
  let minutesToClear: number = 0

  if (perfState.queued_requests) {
    stepsPerRequest =
      perfState.queued_megapixelsteps / perfState.queued_requests
    requestsPerMinute = perfState.past_minute_megapixelsteps / stepsPerRequest
    minutesToClear =
      perfState.queued_megapixelsteps / perfState.past_minute_megapixelsteps
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="row font-bold">Horde Performance</h2>
      {loading && <div>...</div>}
      {!loading && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <div>
            -{' '}
            <strong>
              {!isNaN(perfState.queued_requests)
                ? perfState.queued_requests.toLocaleString()
                : ''}
            </strong>{' '}
            pending image requests (
            <strong>
              {!isNaN(perfState.queued_megapixelsteps)
                ? Math.floor(perfState.queued_megapixelsteps).toLocaleString()
                : ''}{' '}
              megapixelsteps
            </strong>
            )
          </div>
          <div>
            - <strong>{perfState.worker_count}</strong> workers online, running{' '}
            <strong>{perfState.thread_count}</strong> threads
          </div>
          <div>
            -{' '}
            <strong>
              {!isNaN(perfState.queued_forms)
                ? Math.floor(
                    perfState.queued_forms.toLocaleString() as unknown as number
                  )
                : ''}
            </strong>{' '}
            pending interrogation requests
          </div>
          <div>
            - <strong>{perfState.interrogator_count}</strong> interrogation
            workers online, running{' '}
            <strong>{perfState.interrogator_thread_count}</strong> threads
          </div>
          <div>
            - Currently processing about{' '}
            <strong>
              {requestsPerMinute ? Math.floor(requestsPerMinute) : ''}
            </strong>{' '}
            image requests per minute (
            <strong>
              {!isNaN(perfState.past_minute_megapixelsteps)
                ? Math.floor(
                    perfState.past_minute_megapixelsteps
                  ).toLocaleString()
                : ''}{' '}
              megapixelsteps
            </strong>
            ).
          </div>
          <div className="mt-[8px]">
            At this rate, it will take approximately{' '}
            <strong>
              {!isNaN(minutesToClear) ? Math.floor(minutesToClear) : ''} minutes
            </strong>{' '}
            to clear the queue.
          </div>
        </div>
      )}
    </div>
  )
}
