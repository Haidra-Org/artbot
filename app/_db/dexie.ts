import Dexie, { Table } from 'dexie'

import {
  AppSettingsTable,
  FavoriteImage,
  HordeJob,
  ImageEnhancementModulesTable,
  ImageRequest,
  PromptsHistory,
  PromptsJobMap
} from '@/app/_types/ArtbotTypes'
import { ImageFileInterface } from '../_data-models/ImageFile_Dexie'

class ArtBot_v2 extends Dexie {
  public declare appSettings: Table<AppSettingsTable, number>
  public declare favorites: Table<FavoriteImage, number>
  public declare hordeJobs: Table<HordeJob, number>
  public declare imageEnhancementModules: Table<
    ImageEnhancementModulesTable,
    number
  >
  public declare imageFiles: Table<ImageFileInterface, number>
  public declare imageRequests: Table<ImageRequest, number>
  public declare promptsHistory: Table<PromptsHistory, number>
  public declare promptsJobMap: Table<PromptsJobMap, number>

  public constructor() {
    super('ArtBot_v2')
    this.version(1).stores({
      appSettings: '++id, key',
      favorites: '++id, artbot_id, image_id, favorited',
      hordeJobs: '++id, artbot_id, job_id, horde_id, status',
      imageEnhancementModules:
        '++id, model_id, modifier, type, [modifier+type], [model_id+modifier], [model_id+type]',
      imageFiles:
        '++id, artbot_id, horde_id, image_id, imageType, imageStatus, [artbot_id+imageType], [image_id+imageType], [imageStatus+imageType], model, sampler',
      imageRequests: '++id, artbot_id, jobType',
      promptsHistory:
        '++id, artbot_id, hash_id, *promptWords, promptType, favorited, [promptType+favorited]',
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
