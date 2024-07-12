import Dexie from 'dexie'
import { db } from './dexie'
import { ImagesForGallery, JobStatus } from '../_types/ArtbotTypes'
import {
  ImageFileInterface,
  ImageStatus,
  ImageType
} from '../_data-models/ImageFile_Dexie'
import { ArtBotHordeJob } from '../_data-models/ArtBotHordeJob'

export const countCompletedJobsFromDexie = async () => {
  return db.hordeJobs.where('status').equals(JobStatus.Done).count()
}

export const fetchCompletedJobsFromDexie = async (
  limit: number = 20,
  offset: number = 0,
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<ImagesForGallery[]> => {
  let jobsQuery = db.hordeJobs.where('status').equals(JobStatus.Done)

  if (sortDirection === 'desc') {
    jobsQuery = jobsQuery.reverse()
  }

  const jobs = await jobsQuery.offset(offset).limit(limit).toArray()

  const tempJobsWithImageId = await Promise.all(
    jobs.map(async (job) => {
      const imageRequest = await db.imageRequests
        .where('artbot_id')
        .equals(job.artbot_id)
        .first()

      const imageFile = (await db.imageFiles
        .where('[artbot_id+imageType]')
        .equals([job.artbot_id, ImageType.IMAGE])
        .toArray()) as ImageFileInterface[]

      return imageFile.length > 0 && imageRequest
        ? {
            ...job,
            height: imageRequest.height,
            width: imageRequest.width,
            image_id: imageFile[0].image_id,
            image_count: imageFile.length
          }
        : null
    })
  )

  // Filter out the null values to remove jobs without an associated image.
  // Handles issues where job doesn't complete properly or doesn't have images due to errors.

  // @ts-expect-error I am not sure what's going on here at the moment, but everything seems to work!
  const jobsWithImageId = tempJobsWithImageId.filter(
    (job) => job !== null
  ) as (ArtBotHordeJob & { image_id: string })[]

  return jobsWithImageId as ImagesForGallery[]
}

export const fetchCompletedJobsByArtbotIdsFromDexie = async (
  artbotIds: string[],
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<ImagesForGallery[]> => {
  const jobsQuery = db.hordeJobs.where('artbot_id').anyOf(artbotIds)

  const jobs = await jobsQuery.toArray()

  const tempJobsWithImageId = await Promise.all(
    jobs.map(async (job) => {
      const imageRequest = await db.imageRequests
        .where('artbot_id')
        .equals(job.artbot_id)
        .first()

      if (!imageRequest) {
        return null
      }

      const imageFile = (await db.imageFiles
        .where('[artbot_id+imageType]')
        .equals([job.artbot_id, ImageType.IMAGE])
        .toArray()) as ImageFileInterface[]

      return imageFile.length > 0 && imageRequest
        ? {
            ...job,
            height: imageRequest.height,
            width: imageRequest.width,
            image_id: imageFile[0].image_id,
            image_count: imageFile.length
          }
        : { ...job, height: imageRequest.height, width: imageRequest.width }
    })
  )

  // Filter out the null values to remove invalid jobs
  // Handles issues where job doesn't complete properly or doesn't have images due to errors.
  let validJobs = tempJobsWithImageId.filter(
    (job) => job !== null
  ) as ArtBotHordeJob[]

  validJobs = validJobs.sort((a, b) => {
    if (!a.id || !b.id) {
      return 0
    }

    if (sortDirection === 'desc') {
      return b.id - a.id
    } else {
      return a.id - b.id
    }
  })

  return validJobs as ImagesForGallery[]
}

export const countAllImagesForCompletedJobsFromDexie = async () => {
  return db.imageFiles
    .where('[imageStatus+imageType]')
    .equals([ImageStatus.OK, ImageType.IMAGE])
    .count()
}

export const fetchAllImagesForCompletedJobsFromDexie = async (
  limit: number = 20,
  offset: number = 0,
  sortDirection: 'asc' | 'desc' = 'desc'
): Promise<ImagesForGallery[]> => {
  let jobsQuery = db.imageFiles
    .where('[imageStatus+imageType]')
    .equals([ImageStatus.OK, ImageType.IMAGE])

  if (sortDirection === 'desc') {
    jobsQuery = jobsQuery.reverse()
  }

  const jobs = await jobsQuery.offset(offset).limit(limit).toArray()

  const jobsWithImageId = await Promise.all(
    jobs.map(async (job) => {
      const imageRequest = await db.imageRequests
        .where('artbot_id')
        .equals(job.artbot_id)
        .first()

      const jobDetails = await db.hordeJobs
        .where('artbot_id')
        .equals(job.artbot_id)
        .first()

      return {
        ...jobDetails,
        height: imageRequest ? imageRequest.height : undefined,
        width: imageRequest ? imageRequest.width : undefined,
        image_id: job ? job.image_id : undefined
      }
    })
  )

  return jobsWithImageId as ImagesForGallery[]
}

export const fetchPendingJobsByStatusFromDexie = async (
  jobTypes: JobStatus[] = []
) => {
  const jobs = await db.hordeJobs
    .where('status')
    .anyOf([...jobTypes])
    .toArray()

  return jobs
}

export const findAdjacentHordeJobs = async (
  artbotId: string
): Promise<{ prev: string | null; next: string | null }> => {
  const currentJob = await db.hordeJobs
    .where('[status+created_timestamp]')
    .equals([JobStatus.Done, Dexie.maxKey])
    .and((job) => job.artbot_id === artbotId)
    .first()

  if (!currentJob) {
    return { prev: null, next: null }
  }

  const { created_timestamp } = currentJob

  const nextJob = await db.hordeJobs
    .where('[status+created_timestamp]')
    .between(
      [JobStatus.Done, Dexie.minKey],
      [JobStatus.Done, created_timestamp],
      true,
      false
    )
    .reverse()
    .first()

  const prevJob = await db.hordeJobs
    .where('[status+created_timestamp]')
    .between(
      [JobStatus.Done, created_timestamp],
      [JobStatus.Done, Dexie.maxKey],
      false,
      true
    )
    .first()

  return {
    prev: prevJob ? prevJob.artbot_id : null,
    next: nextJob ? nextJob.artbot_id : null
  }
}

export const getJobsFromDexieById = async (artbotIds: string[]) => {
  // Use Dexie's where().anyOf() to find records matching any artbot_id in the array
  const files = await db.hordeJobs.where('artbot_id').anyOf(artbotIds).toArray()
  return files
}

/**
 * Updates a horde job by its unique artbot_id with the given updates within a transaction.
 * Only fields present in updates are modified, excluding artbot_id.
 * @param artbot_id The unique identifier for the horde job to update.
 * @param updates A partial HordeJob object with updates to apply.
 */
export const updateHordeJobById = async (
  artbot_id: string,
  updates: Partial<Omit<ArtBotHordeJob, 'artbot_id'>>
) => {
  // Automatically set the updated_timestamp to the current time
  const updateData = { ...updates, updated_timestamp: Date.now() }

  // Perform the update within a Dexie transaction
  await db.transaction('rw', db.hordeJobs, async () => {
    await db.hordeJobs.where({ artbot_id }).modify(updateData)
  })
}
