import { ImageError, JobStatus } from '../_types/ArtbotTypes'
import {
  GenMetadata,
  HordeGeneration,
  HordeJobResponse
} from '../_types/HordeTypes'

export class ArtBotHordeJob implements HordeJobResponse {
  id?: number
  artbot_id: string
  job_id: string
  horde_id: string
  created_timestamp: number
  horde_received_timestamp: number | null
  horde_completed_timestamp: number | null
  updated_timestamp: number
  status: JobStatus
  errors?: ImageError[] | null
  height: number
  init_wait_time: number | null
  images_requested: number
  images_completed: number
  images_failed: number
  jobErrorMessage: string
  width: number
  gen_metadata?: GenMetadata[]
  api_response?: HordeJobResponse
  finished: number
  processing: number
  restarted: number
  waiting: number
  done: boolean
  faulted: boolean
  wait_time: number | null
  queue_position: number | null
  kudos: number
  is_possible: boolean
  generations?: HordeGeneration[]

  constructor(params: Partial<ArtBotHordeJob> = {}) {
    this.id = params.id
    this.artbot_id = params.artbot_id || ''
    this.job_id = params.job_id || ''
    this.horde_id = params.horde_id || ''
    this.created_timestamp = params.created_timestamp || Date.now()
    this.horde_received_timestamp = params.horde_received_timestamp || null
    this.horde_completed_timestamp = params.horde_completed_timestamp || null
    this.updated_timestamp = params.updated_timestamp || Date.now()
    this.status = params.status || JobStatus.Waiting
    this.errors = params.errors || null
    this.init_wait_time = params.init_wait_time || null
    this.images_requested = params.images_requested || 0
    this.images_completed = params.images_completed || 0
    this.images_failed = params.images_failed || 0
    this.height = params.height || 0
    this.width = params.width || 0
    this.gen_metadata = params.gen_metadata
    this.api_response = params.api_response
    this.jobErrorMessage = params.jobErrorMessage || ''

    // Specific fields from AI Horde response
    this.finished = params.finished || 0
    this.processing = params.processing || 0
    this.restarted = params.restarted || 0
    this.waiting = params.waiting || 0
    this.done = params.done || false
    this.faulted = params.faulted || false
    this.wait_time = params.wait_time || null
    this.queue_position = params.queue_position || null
    this.kudos = params.kudos || 0
    this.is_possible = params.is_possible || false
    this.generations = params.generations
  }

  update(params: Partial<ArtBotHordeJob>): void {
    Object.assign(this, params)
  }
}
