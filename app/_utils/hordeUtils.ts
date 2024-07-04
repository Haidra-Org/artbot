import { SavedEmbedding } from '../_data-models/Civitai'
import { TextualInversion } from '../_types/HordeTypes'

export const castTiInject = (
  tis: SavedEmbedding[] | TextualInversion[]
): TextualInversion[] => {
  let updatedTis: TextualInversion[] = []
  if (tis && Array.isArray(tis) && tis.length > 0) {
    updatedTis = tis.map((ti) => {
      const obj: TextualInversion = {
        name: String(ti.name)
      }

      if (ti.inject_ti) {
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
