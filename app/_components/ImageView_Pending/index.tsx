import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests'
import { getJobsFromDexieById } from '@/app/_db/hordeJobs'
import { ImageRequest, JobStatus } from '@/app/_types/ArtbotTypes'
import {
  IconEdit,
  IconInfoCircle,
  IconPlaylistAdd,
  IconPlaylistX,
  IconRecycle,
  IconTrash
} from '@tabler/icons-react'
import ImageDetails from '../ImageDetails'
import { JobDetails } from '@/app/_hooks/useImageDetails'
import { deletePendingImageFromAppState } from '@/app/_stores/PendingImagesStore'
import Button from '../Button'
import cloneDeep from 'clone-deep'
import { updateInputTimstamp } from '@/app/_stores/CreateImageStore'
import NiceModal from '@ebay/nice-modal-react'
import { deleteJobFromDexie } from '@/app/_db/jobTransactions'
import { clientHeader } from '@/app/_data-models/ClientHeader'
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob'
import PendingImageViewStatus from './ImageView_PendingStatus'
import { updatePendingImage } from '@/app/_controllers/pendingJobs/updatePendingImage'

interface PendingImageViewProps {
  artbot_id: string
}

export default function PendingImageView({ artbot_id }: PendingImageViewProps) {
  const router = useRouter()
  const [imageDetails, setImageDetails] = useState<ImageRequest>()
  const [jobDetails, setJobDetails] = useState<ArtBotHordeJob>()

  const serverHasJob =
    jobDetails &&
    (jobDetails.status === JobStatus.Queued ||
      jobDetails.status === JobStatus.Processing)

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

  return (
    <div className="col w-full justify-center">
      <h2 className="row font-bold">Pending Image Details</h2>
      <div className="row font-bold text-sm text-white">
        <IconInfoCircle /> Job Details
      </div>
      <PendingImageViewStatus artbot_id={artbot_id} />
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
      <ImageDetails
        imageDetails={
          {
            jobDetails: jobDetails,
            imageRequest: imageDetails,
            imageFile: {}
          } as JobDetails
        }
      />
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
            updateJobDetails.created_timestamp = Date.now()
            updateJobDetails.updated_timestamp = Date.now()

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
