import { SavedEmbedding } from '../_data-models/Civitai'
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
