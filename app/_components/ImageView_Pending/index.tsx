import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Section from '../Section'
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests'
import { getJobsFromDexieById } from '@/app/_db/hordeJobs'
import {
  HordeJob,
  ImageError,
  ImageRequest,
  JobStatus
} from '@/app/_types/ArtbotTypes'
import {
  IconEdit,
  IconInfoCircle,
  IconPlaylistAdd,
  IconPlaylistX,
  IconRecycle,
  IconSettings,
  IconTrash
} from '@tabler/icons-react'
import ImageDetails from '../ImageDetails'
import { JobDetails } from '@/app/_hooks/useImageDetails'
import { useStore } from 'statery'
import {
  PendingImagesStore,
  deletePendingImageFromAppState
} from '@/app/_stores/PendingImagesStore'
import Button from '../Button'
import cloneDeep from 'clone-deep'
import { updateInputTimstamp } from '@/app/_stores/CreateImageStore'
import NiceModal from '@ebay/nice-modal-react'
import { updatePendingImage } from '@/app/_controllers/pendingJobController'
import { deleteJobFromDexie } from '@/app/_db/jobTransactions'
import { formatPendingPercentage } from '@/app/_utils/numberUtils'
import { clientHeader } from '@/app/_data-models/ClientHeader'

interface PendingImageViewProps {
  artbot_id: string
}

const countErrorMessages = (
  errors: ImageError[]
): { message: string; count: number }[] => {
  const errorCountMap: { [key: string]: number } = errors.reduce(
    (acc: { [key: string]: number }, error: ImageError) => {
      if (acc[error.message]) {
        acc[error.message] += 1
      } else {
        acc[error.message] = 1
      }
      return acc
    },
    {}
  )

  return Object.entries(errorCountMap).map(([message, count]) => ({
    message,
    count
  }))
}

function formatJobStatus(status: JobStatus) {
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

export default function PendingImageView({ artbot_id }: PendingImageViewProps) {
  const router = useRouter()
  const { pendingImages } = useStore(PendingImagesStore)
  const [imageDetails, setImageDetails] = useState<ImageRequest>()
  const [jobDetails, setJobDetails] = useState<HordeJob>()

  const serverHasJob =
    jobDetails &&
    (jobDetails.status === JobStatus.Queued ||
      jobDetails.status === JobStatus.Processing)

  const pendingImage = pendingImages.find(
    (image) => image.artbot_id === artbot_id
  )

  const imageError =
    pendingImage?.status === JobStatus.Error ||
    pendingImage?.images_failed === pendingImage?.images_requested

  const handleCancelPendingJob = useCallback(async () => {
    if (!jobDetails || !jobDetails.horde_id) return

    try {
      await fetch(
        `https://aihorde.net/api/v2/generate/status/${jobDetails.horde_id}`,
        {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader()
          },
          method: 'DELETE'
        }
      )
    } catch (err) {
      console.error('Unable to delete pending job:', err)
    }
  }, [jobDetails])

  useEffect(() => {
    async function fetchData() {
      const [imageRequest] = await getImageRequestsFromDexieById([artbot_id])
      const [job] = await getJobsFromDexieById([artbot_id])

      setImageDetails(imageRequest)
      setJobDetails(job)
    }

    fetchData()
  }, [artbot_id])

  const JobErrorsComponent = (errors: ImageError[] = []) => {
    const countedErrors = countErrorMessages(errors)

    return (
      <div className="mt-2">
        <strong>Errors:</strong>{' '}
        {countedErrors.length > 0 && (
          <div>
            {countedErrors.map(({ message, count }, idx) => (
              <div key={idx} className={`image_error_${idx} text-xs`}>
                ({count} {count === 1 ? 'image' : 'images'}) {message}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const pctComplete = formatPendingPercentage({
    init: pendingImage?.init_wait_time as number,
    remaining: pendingImage?.wait_time as number
  })

  return (
    <div className="col w-full justify-center">
      <h2 className="row font-bold">Pending Image Details</h2>
      <div className="row font-bold text-sm text-white">
        <IconInfoCircle /> Job Details
      </div>
      <Section className="p-0">
        <div className="text-white font-mono p-0 w-full text-[14px] col gap-0">
          <div>
            <strong>Job status:</strong>{' '}
            {imageError
              ? 'AI Horde Error'
              : formatJobStatus(pendingImage?.status as JobStatus)}
          </div>
          {pendingImage &&
            pendingImage?.queue_position !== null &&
            pendingImage?.queue_position > 0 && (
              <div>
                <strong>Queue position:</strong> {pendingImage?.queue_position}
              </div>
            )}
          {jobDetails?.status !== JobStatus.Done &&
            jobDetails?.status !== JobStatus.Error && (
              <div>
                <strong>Wait time:</strong> {pendingImage?.wait_time} seconds{' '}
                {pctComplete ? <span>({pctComplete}% complete)</span> : ''}
              </div>
            )}
          <div>
            <strong>Images requested:</strong> {jobDetails?.images_requested}
          </div>
          {jobDetails?.images_completed ? (
            <div>
              <strong>Images completed:</strong> {jobDetails?.images_completed}
            </div>
          ) : (
            ''
          )}
          {jobDetails?.images_failed ? (
            <div>
              <strong>Images failed to complete:</strong>{' '}
              {jobDetails?.images_failed}
            </div>
          ) : (
            ''
          )}
          {jobDetails?.errors &&
            jobDetails?.errors.length > 0 &&
            JobErrorsComponent(jobDetails?.errors)}
        </div>
      </Section>
      <div className="col gap-1 w-full">
        <div className="row gap-2 text-sm font-bold">
          <IconPlaylistAdd stroke={1} />
          Prompt
        </div>
        <div className="w-full text-sm ml-[8px] break-words">
          {imageDetails?.prompt}
        </div>
      </div>
      {imageDetails?.negative && (
        <div className="col gap-0 w-full">
          <div className="row gap-2 text-sm font-bold">
            <IconPlaylistX stroke={1} />
            Negative
          </div>
          <div className="w-full text-sm ml-[8px] break-words">
            {imageDetails?.negative}
          </div>
        </div>
      )}
      <div className="col gap-2 w-full">
        <div className="row gap-2 text-sm font-bold">
          <IconSettings stroke={1} />
          Image details
        </div>
        <ImageDetails
          imageDetails={
            {
              jobDetails: jobDetails,
              imageRequest: imageDetails,
              imageFile: {}
            } as JobDetails
          }
        />
      </div>
      <div className="row justify-end gap-2">
        <Button
          onClick={() => {
            const updateImageDetails = cloneDeep(imageDetails)
            // @ts-expect-error New ArtBot ID will be added if image is requested
            delete updateImageDetails?.artbot_id
            // @ts-expect-error id exists on imageDetails after database query
            delete updateImageDetails?.id

            const jsonString = JSON.stringify(updateImageDetails)
            sessionStorage.setItem('userInput', jsonString)
            updateInputTimstamp()
            NiceModal.remove('modal')
            router.push('/create')
          }}
        >
          <IconEdit /> Edit
        </Button>
        <Button
          onClick={async () => {
            const updateJobDetails = cloneDeep(jobDetails)

            if (!updateJobDetails) return

            // @ts-expect-error New HordeID will be added on response from Horde
            delete updateJobDetails.horde_id

            updateJobDetails.images_completed = 0
            updateJobDetails.images_failed = 0
            updateJobDetails.init_wait_time = 0
            updateJobDetails.wait_time = 0
            updateJobDetails.status = JobStatus.Waiting

            await updatePendingImage(updateJobDetails.artbot_id, {
              ...updateJobDetails
            })

            NiceModal.remove('modal')
          }}
        >
          <IconRecycle /> Try again?
        </Button>
        <Button
          theme="danger"
          onClick={async () => {
            if (serverHasJob) {
              handleCancelPendingJob()
            }

            const artbot_id = imageDetails?.artbot_id as string
            deletePendingImageFromAppState(artbot_id)
            await deleteJobFromDexie(artbot_id)
            NiceModal.remove('modal')
          }}
        >
          <IconTrash />{' '}
          {serverHasJob ? <span>Cancel?</span> : <span>Delete?</span>}
        </Button>
      </div>
    </div>
  )
}
