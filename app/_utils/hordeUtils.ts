import { SavedEmbedding } from '../_data-models/Civitai'
import { JobStatus } from '../_types/ArtbotTypes'
import { HordeTi } from '../_types/HordeTypes'

export const castTiInject = (tis: SavedEmbedding[]): HordeTi[] => {
  let updatedTis: HordeTi[] = []
  if (tis && Array.isArray(tis) && tis.length > 0) {
    updatedTis = tis.map((ti) => {
      const obj: HordeTi = {
        name: String(ti.id),
        strength: 0
      }

      if (ti.inject_ti === 'prompt' || ti.inject_ti === 'negprompt') {
        obj.inject_ti = ti.inject_ti
      }

      if (ti.strength) {
        obj.strength = ti.strength
      }

      return obj
    })
  }

  return updatedTis
}

export const formatJobStatus = (status: JobStatus) => {
  switch (status) {
    case 'waiting':
      return 'Waiting'
    case 'queued':
      return 'Queued'
    case 'requested':
      return 'Requested'
    case 'processing':
      return 'Processing'
    case 'done':
      return 'Done'
    case 'error':
      return 'Error'
    default:
      return status
  }
}
