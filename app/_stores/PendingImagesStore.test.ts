import { HordeJob, JobStatus } from '../_types/ArtbotTypes'
import {
  PendingImagesStore,
  addPendingImageToAppState,
  getPendingImageByIdFromAppState,
  getPendingImagesByStatusFromAppState,
  deletePendingImageFromAppState,
  updatePendingImageInAppState
} from './PendingImagesStore' // replace with your actual file name

describe('PendingImagesStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    PendingImagesStore.set({ pendingImages: [] })
  })

  it('should add a pending image to the store', () => {
    const job: HordeJob = {
      artbot_id: '1',
      job_id: 'job1',
      horde_id: 'horde1',
      created_timestamp: Date.now(),
      horde_received_timestamp: Date.now(),
      horde_completed_timestamp: Date.now(),
      updated_timestamp: Date.now(),
      status: JobStatus.Waiting,
      queue_position: null,
      init_wait_time: null,
      wait_time: null,
      images_requested: 1,
      images_completed: 0,
      images_failed: 0,
      height: 512,
      width: 512
    }

    addPendingImageToAppState(job)

    expect(PendingImagesStore.state.pendingImages).toContainEqual(job)
  })

  it('should retrieve a pending image by artbot_id', () => {
    const job: HordeJob = {
      artbot_id: '1',
      job_id: 'job1',
      horde_id: 'horde1',
      created_timestamp: Date.now(),
      horde_received_timestamp: Date.now(),
      horde_completed_timestamp: Date.now(),
      updated_timestamp: Date.now(),
      status: JobStatus.Waiting,
      queue_position: null,
      init_wait_time: null,
      wait_time: null,
      images_requested: 1,
      images_completed: 0,
      images_failed: 0,
      height: 512,
      width: 512
    }

    addPendingImageToAppState(job)

    const retrievedJob = getPendingImageByIdFromAppState('1')
    expect(retrievedJob).toEqual(job)
  })

  it('should retrieve pending images by status', () => {
    const job1: HordeJob = {
      artbot_id: '1',
      job_id: 'job1',
      horde_id: 'horde1',
      created_timestamp: Date.now(),
      horde_received_timestamp: Date.now(),
      horde_completed_timestamp: Date.now(),
      updated_timestamp: Date.now(),
      status: JobStatus.Waiting,
      queue_position: null,
      init_wait_time: null,
      wait_time: null,
      images_requested: 1,
      images_completed: 0,
      images_failed: 0,
      height: 512,
      width: 512
    }

    const job2: HordeJob = {
      artbot_id: '2',
      job_id: 'job2',
      horde_id: 'horde2',
      created_timestamp: Date.now(),
      horde_received_timestamp: Date.now(),
      horde_completed_timestamp: Date.now(),
      updated_timestamp: Date.now(),
      status: JobStatus.Processing,
      queue_position: null,
      init_wait_time: null,
      wait_time: null,
      images_requested: 1,
      images_completed: 0,
      images_failed: 0,
      height: 512,
      width: 512
    }

    addPendingImageToAppState(job1)
    addPendingImageToAppState(job2)

    const waitingJobs = getPendingImagesByStatusFromAppState([
      JobStatus.Waiting
    ])
    const processingJobs = getPendingImagesByStatusFromAppState([
      JobStatus.Processing
    ])

    expect(waitingJobs).toContainEqual(job1)
    expect(waitingJobs).not.toContainEqual(job2)
    expect(processingJobs).toContainEqual(job2)
    expect(processingJobs).not.toContainEqual(job1)
  })

  it('should delete a pending image from the store', () => {
    const job: HordeJob = {
      artbot_id: '1',
      job_id: 'job1',
      horde_id: 'horde1',
      created_timestamp: Date.now(),
      horde_received_timestamp: Date.now(),
      horde_completed_timestamp: Date.now(),
      updated_timestamp: Date.now(),
      status: JobStatus.Waiting,
      queue_position: null,
      init_wait_time: null,
      wait_time: null,
      images_requested: 1,
      images_completed: 0,
      images_failed: 0,
      height: 512,
      width: 512
    }

    addPendingImageToAppState(job)
    deletePendingImageFromAppState('1')

    expect(PendingImagesStore.state.pendingImages).not.toContainEqual(job)
  })

  it('should update a pending image in the store', () => {
    const job: HordeJob = {
      artbot_id: '1',
      job_id: 'job1',
      horde_id: 'horde1',
      created_timestamp: Date.now(),
      horde_received_timestamp: Date.now(),
      horde_completed_timestamp: Date.now(),
      updated_timestamp: Date.now(),
      status: JobStatus.Waiting,
      queue_position: null,
      init_wait_time: null,
      wait_time: null,
      images_requested: 1,
      images_completed: 0,
      images_failed: 0,
      height: 512,
      width: 512
    }

    const updatedJob: Partial<HordeJob> = {
      status: JobStatus.Processing,
      images_completed: 1
    }

    addPendingImageToAppState(job)
    updatePendingImageInAppState('1', updatedJob)

    const expectedJob = { ...job, ...updatedJob }
    expect(PendingImagesStore.state.pendingImages).toContainEqual(expectedJob)
  })
})
