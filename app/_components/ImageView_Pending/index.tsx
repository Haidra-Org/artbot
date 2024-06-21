import { useEffect, useState } from 'react'
import Section from '../Section'
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests'
import { getJobsFromDexieById } from '@/app/_db/hordeJobs'
import { HordeJob, ImageRequest, JobStatus } from '@/app/_types/ArtbotTypes'
import {
  IconInfoCircle,
  IconPlaylistAdd,
  IconPlaylistX,
  IconSettings
} from '@tabler/icons-react'
import ImageDetails from '../ImageDetails'
import { JobDetails } from '@/app/_hooks/useImageDetails'
import { useStore } from 'statery'
import { PendingImagesStore } from '@/app/_stores/PendingImagesStore'

interface PendingImageViewProps {
  artbot_id: string
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

function formatPercentage({
  init,
  remaining
}: {
  init: number
  remaining: number
}) {
  if (init > 0 && remaining >= 0) {
    const pct = 100 - (remaining / init) * 100
    return Math.round(pct * 100) / 100
  }
}

export default function PendingImageView({ artbot_id }: PendingImageViewProps) {
  const { pendingImages } = useStore(PendingImagesStore)
  const [imageDetails, setImageDetails] = useState<ImageRequest>()
  const [jobDetails, setJobDetails] = useState<HordeJob>()

  const pendingImage = pendingImages.find(
    (image) => image.artbot_id === artbot_id
  )

  const imageError =
    pendingImage?.status === JobStatus.Error ||
    pendingImage?.images_failed === pendingImage?.images_requested

  useEffect(() => {
    async function fetchData() {
      const [imageRequest] = await getImageRequestsFromDexieById([artbot_id])
      const [job] = await getJobsFromDexieById([artbot_id])

      setImageDetails(imageRequest)
      setJobDetails(job)
    }

    fetchData()
  }, [artbot_id])

  const pctComplete = formatPercentage({
    init: jobDetails?.init_wait_time as number,
    remaining: jobDetails?.wait_time as number
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
              : formatJobStatus(jobDetails?.status as JobStatus)}
          </div>
          {jobDetails &&
            jobDetails?.queue_position !== null &&
            jobDetails?.queue_position > 0 && (
              <div>
                <strong>Queue position:</strong> {jobDetails?.queue_position}
              </div>
            )}
          {jobDetails?.status !== JobStatus.Done && (
            <div>
              <strong>Wait time:</strong> {jobDetails?.wait_time} seconds{' '}
              {pctComplete && <span>({pctComplete}% complete)</span>}
            </div>
          )}
          <div>
            <strong>Images requested:</strong> {jobDetails?.images_requested}
          </div>
          {jobDetails?.images_failed && (
            <div>
              <strong>Images failed to complete:</strong>{' '}
              {jobDetails?.images_failed}
            </div>
          )}
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
    </div>
  )
}
