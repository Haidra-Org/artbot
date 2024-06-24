'use client'

import React from 'react'
import {
  IconAlertTriangle,
  IconLibraryPhoto,
  IconPhotoUp,
  IconTrash,
  IconX
} from '@tabler/icons-react'
// import { deletePendingImageFromAppState } from '@/app/_store/PendingImagesStore'
// import { JobStatus } from '@/app/_types/artbot'
// import ParticleAnimation from '@/app/_components/ui/ParticleLoader'
// import { deleteJobFromDexie } from '@/app/_db/transactions'
// import { usePendingJob } from '../../_hooks/usePendingJob'
// import NiceModal from '@ebay/nice-modal-react'
import { JobStatus } from '../../_types/ArtbotTypes'
import { usePendingJob } from '../../_hooks/usePendingJob'
import { deletePendingImageFromAppState } from '../../_stores/PendingImagesStore'
import { deleteJobFromDexie } from '../../_db/jobTransactions'
import ParticleAnimation from '../ParticleAnimation'
import styles from './pendingImageOverlay.module.css'
import { formatPendingPercentage } from '@/app/_utils/numberUtils'
// import DeleteConfirmation from '@/app/_components/modals/DeleteConfirmation'

function PendingImageOverlay({
  artbot_id,
  imageCount = 1,
  status
}: {
  artbot_id: string
  imageCount?: number
  status: JobStatus
}) {
  const [pendingJob] = usePendingJob(artbot_id)

  const serverHasJob =
    status === JobStatus.Queued || status === JobStatus.Processing

  const imageError =
    status === JobStatus.Error ||
    (status === JobStatus.Done &&
      !isNaN(pendingJob?.images_completed) &&
      pendingJob?.images_completed === 0)

  const pctComplete = formatPendingPercentage({
    init: pendingJob?.init_wait_time as number,
    remaining: pendingJob?.wait_time as number
  })

  let serverWorkingMessage = 'Waiting...'

  if (status === JobStatus.Requested) {
    serverWorkingMessage = `Requested...`
  }

  if (status === JobStatus.Queued) {
    serverWorkingMessage = `Queued... ${pendingJob.queue_position ? `(Position #${pendingJob.queue_position})` : ''}`
  }

  if (status === JobStatus.Processing) {
    serverWorkingMessage = `Processing...`
  }

  return (
    <div className={styles.PendingImageOverlay}>
      <div
        className={styles.CloseIcon}
        onClick={async (e) => {
          e.preventDefault()
          e.stopPropagation()

          deletePendingImageFromAppState(artbot_id)

          // TODO: FIXME: Handle Errors
          // if (pendingJob?.status === JobStatus.Done) {
          //   await deleteJobFromDexie(artbot_id)
          // }

          if (pendingJob?.status !== JobStatus.Done) {
            await deleteJobFromDexie(artbot_id)
          }
        }}
        title="Remove pending job from queue"
      >
        <IconX />
      </div>

      {(status === JobStatus.Done || status === JobStatus.Error) && (
        <div
          className={styles.TrashIcon}
          onClick={async (e) => {
            e.preventDefault()
            e.stopPropagation()

            // NiceModal.show('delete', {
            //   children: (
            //     <DeleteConfirmation
            //       message={
            //         <>
            //           {imageCount > 1 && (
            //             <>
            //               <p>Are you sure you want to delete these images? </p>
            //               <p>
            //                 <strong>
            //                   All {imageCount} images generated with this
            //                   request will be deleted.
            //                 </strong>
            //               </p>
            //               <p>
            //                 This <strong>can not</strong> be undone.
            //               </p>
            //             </>
            //           )}
            //           {imageCount === 1 && (
            //             <>
            //               <p>Are you sure you want to delete this images? </p>
            //               <p>
            //                 This <strong>can not</strong> be undone.
            //               </p>
            //             </>
            //           )}
            //         </>
            //       }
            //       onDelete={async () => {
            //         deletePendingImageFromAppState(artbot_id)
            //         await deleteJobFromDexie(artbot_id)

            //         // For now, just close modal on delete
            //         NiceModal.remove('modal')
            //       }}
            //     />
            //   )
            // })
          }}
          title="Delete these images from ArtBot"
        >
          <IconTrash stroke={1} />
        </div>
      )}

      {status === JobStatus.Waiting && (
        <>
          <div className={styles.ImageStatusIcon}>
            <IconPhotoUp
              color="white"
              stroke={1}
              style={{ position: 'absolute', height: '40px', width: '40px' }}
            />
          </div>
          <div className={styles.ImageStatus}>Waiting to request image...</div>
        </>
      )}

      {status === JobStatus.Requested && (
        <>
          <div className={styles.ImageStatusIcon}>
            <IconPhotoUp
              color="white"
              stroke={1}
              style={{ position: 'absolute', height: '40px', width: '40px' }}
            />
          </div>
          <div className={styles.ImageStatus}>Image requested...</div>
        </>
      )}

      {serverHasJob && (
        <>
          <div className={styles.ImageStatusIcon}>
            <ParticleAnimation />
          </div>
          <div
            className={styles.ImageStatusWorking}
            style={{ marginBottom: '12px' }}
          >
            {pendingJob.wait_time !== null &&
            pendingJob.wait_time > 0 &&
            pendingJob.init_wait_time !== 0 ? (
              <div className="col gap-0">
                <div>{serverWorkingMessage}</div>
                <div>
                  {pctComplete}% / ({pendingJob.wait_time}s remaining)
                </div>
              </div>
            ) : (
              <span></span>
            )}
            {pendingJob.init_wait_time &&
            pendingJob.wait_time === 0 &&
            pendingJob.wait_time < pendingJob.init_wait_time ? (
              <span>Finishing up...</span>
            ) : (
              <span></span>
            )}
          </div>
        </>
      )}
      {serverHasJob && <div></div>}
      {(status === JobStatus.Error || imageError) && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
            gap: '8px',
            fontFamily: 'monospace',
            backgroundColor: 'black',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'url(/tile.png)',
            backgroundSize: 'auto',
            backgroundRepeat: 'repeat',
            boxShadow: 'inset 0px 0px 70px -3px rgba(0,0,0,0.8)'
          }}
        >
          <IconAlertTriangle color="rgb(234 179 8)" size={48} stroke={1} />
          <div>Error: Unable to process image</div>
        </div>
      )}
      {(status === JobStatus.Queued || status === JobStatus.Processing) && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: 'black'
          }}
        >
          <div
            style={{
              backgroundColor: 'rgb(20, 184, 166)',
              height: '100%',
              transition: 'width 0.5s ease-in-out',
              width: `${pctComplete}%`
            }}
          />
        </div>
      )}
      {imageCount > 1 && (
        <div className={styles.ImageCount}>
          <IconLibraryPhoto stroke={1.5} />
          {imageCount}
        </div>
      )}
    </div>
  )
}

export default React.memo(PendingImageOverlay, (prevProps, nextProps) => {
  // This is an optional comparison function that allows you to customize
  // the behavior of memoization. If not provided, React will shallow compare all props by default.
  // In this case, it's comparing if 'artbot_id' or 'status' have changed.
  return (
    prevProps.artbot_id === nextProps.artbot_id &&
    prevProps.status === nextProps.status
  )
})
