import Dexie, { Table } from 'dexie'

import {
  FavoriteImage,
  HordeJob,
  ImageRequest,
  PromptsHistory,
  PromptsJobMap
} from '@/app/_types/ArtbotTypes'
import { ImageFileInterface } from '../_data-models/ImageFile_Dexie'

class ArtBot_v2 extends Dexie {
  public favorites!: Table<FavoriteImage, number>
  public hordeJobs!: Table<HordeJob, number>
  public imageFiles!: Table<ImageFileInterface, number>
  public imageRequests!: Table<ImageRequest, number>
  public promptsHistory!: Table<PromptsHistory, number>
  public promptsJobMap!: Table<PromptsJobMap, number>

  public constructor() {
    super('ArtBot_v2')
    this.version(1).stores({
      favorites: '++id, artbot_id, image_id, favorited',
      hordeJobs: '++id, artbot_id, horde_id, status',
      imageFiles:
        '++id, artbot_id, horde_id, image_id, imageType, imageStatus, [artbot_id+imageType], [image_id+imageType], [imageStatus+imageType], model, sampler',
      imageRequests: '++id, artbot_id, jobType',
      promptsHistory: '++id, artbot_id, hash_id, *promptWords',
      promptsJobMap: '++id, artbot_id, prompt_id'
    })
  }
}

const db: ArtBot_v2 = new ArtBot_v2()

export const initDexie = () => {
  if (db) {
    console.log(`ArtBot IndexedDB initialized.`)
  }
}

export { db }
