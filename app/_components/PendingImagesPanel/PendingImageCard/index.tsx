import React, { useCallback } from 'react';
import styles from './PendingImageCard.module.css';
import { appBasepath } from '@/app/_utils/browserUtils';
import Section from '../../Section';
import {
  IconPhotoCheck,
  IconPhotoDown,
  IconPhotoExclamation,
  IconX
} from '@tabler/icons-react'; // Import the Tabler Icon
import PendingImageOverlayV2 from '../PendingImageOverlayV2';
import { formatPendingPercentage } from '@/app/_utils/numberUtils';
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob';
import { useImageRequestDetails } from '@/app/_hooks/useImageRequestDetails';
import { JobStatus } from '@/app/_types/ArtbotTypes';
import ImageThumbnail from '../../ImageThumbnail';
import { deletePendingImageFromAppState } from '@/app/_stores/PendingImagesStore';
import { deleteJobFromDexie } from '@/app/_db/jobTransactions';
import { getImagesForArtbotJobFromDexie } from '@/app/_db/ImageFiles';
import { clientHeader } from '@/app/_data-models/ClientHeader';
import { updatePendingImage } from '@/app/_controllers/pendingJobs/updatePendingImage';
import NiceModal from '@ebay/nice-modal-react';
import ImageView from '../../ImageView';
import PendingImageView from '../../ImageView_Pending';

interface CardProps {
  pendingImage: ArtBotHordeJob;
}

const PendingImageCard: React.FC<CardProps> = ({ pendingImage }) => {
  const { imageDetails, jobDetails } = useImageRequestDetails(
    pendingImage?.artbot_id
  );

  const handleCancelPendingJob = useCallback(async () => {
    if (!jobDetails || !jobDetails.horde_id) return;

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
      );
    } catch (err) {
      console.error('Unable to delete pending job:', err);
    }
  }, [jobDetails]);

  if (!jobDetails) {
    return null;
  }
  const serverHasJob =
    jobDetails.status === JobStatus.Queued ||
    jobDetails.status === JobStatus.Processing;

  const formattedTimestamp = new Date(
    jobDetails.created_timestamp
  ).toLocaleString();

  let pctComplete = formatPendingPercentage({
    init: jobDetails.init_wait_time as number,
    remaining: jobDetails.wait_time as number
  });

  if (
    jobDetails.status === JobStatus.Done ||
    jobDetails.status === JobStatus.Error
  ) {
    pctComplete = 100 as unknown as string;
  }

  const prettyEta = (eta: number | null | undefined) => {
    if (typeof eta === 'undefined' || eta === null || isNaN(eta)) {
      return '';
    }

    if (
      jobDetails.status === JobStatus.Done ||
      jobDetails.status === JobStatus.Error
    ) {
      return '';
    }

    // Add 10 seconds to the ETA to account for processing time
    eta += 10;

    const hours = Math.floor(eta / 3600);
    const minutes = Math.floor((eta % 3600) / 60);
    const seconds = eta % 60;

    if (hours > 0) {
      return `(${hours}h ${minutes}m ${seconds}s)`;
    } else if (minutes > 0) {
      return `(${minutes}m ${seconds}s)`;
    } else {
      return `(${seconds}s)`;
    }
  };

  const handleClose = async () => {
    // e.preventDefault();
    // e.stopPropagation();

    if (jobDetails.status === JobStatus.Done) {
      deletePendingImageFromAppState(pendingImage.artbot_id);
      return;
    }

    if (!serverHasJob) {
      deletePendingImageFromAppState(pendingImage.artbot_id);
      await deleteJobFromDexie(pendingImage.artbot_id);
      return;
    }

    const images =
      (await getImagesForArtbotJobFromDexie(pendingImage.artbot_id)) || [];

    // If partial job is still processing, mark as done and delete from app state
    if (serverHasJob && images.length > 0) {
      handleCancelPendingJob();
      await updatePendingImage(pendingImage.artbot_id, {
        status: JobStatus.Done
      });
      return;
    }

    if (serverHasJob && images.length === 0) {
      handleCancelPendingJob();
    }
  };

  return (
    <Section className="text-white">
      <div className="flex flex-col gap-0">
        {/* Header with Close Button and Image Count */}
        <div className={styles.cardHeader}>
          <button className={styles.closeButton} onClick={handleClose}>
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.cardTop}>
          <div
            className={styles.cardImage}
            onClick={() => {
              if (jobDetails.status !== JobStatus.Done) {
                NiceModal.show('modal', {
                  children: (
                    <PendingImageView artbot_id={pendingImage.artbot_id} />
                  ),
                  modalClassName: 'w-full md:min-w-[640px] max-w-[768px]'
                });
              } else {
                NiceModal.show('modal', {
                  children: (
                    <ImageView
                      artbot_id={jobDetails.artbot_id}
                      showPendingPanel={true}
                    />
                  )
                });
              }
            }}
          >
            <PendingImageOverlayV2 status={jobDetails.status} />
            <div
              className={styles.placeholderImage}
              style={{
                backgroundImage: `url(${appBasepath()}/tile.png)`
              }}
            >
              {jobDetails.status === JobStatus.Done && (
                <ImageThumbnail
                  artbot_id={pendingImage.artbot_id}
                  alt="Pending Image"
                  square={true}
                />
              )}
            </div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardImageDetails}>
              <div>
                <strong>Model:</strong> {imageDetails?.models[0]}
              </div>
              <div>
                <strong>Sampler:</strong> {imageDetails?.sampler}
              </div>
              <div>
                <strong>Steps:</strong> {imageDetails?.steps}
              </div>
            </div>

            <div className={styles.cardImageDetails}>
              <div className={styles.statusText}>
                <strong>Status:</strong> {jobDetails.status}
              </div>
              <div className={styles.timestampText}>{formattedTimestamp}</div>
            </div>
          </div>
        </div>

        {/* Status and Timestamp */}
        <div className={styles.cardStatus}>
          <div className={styles.imagesCount}>
            {jobDetails.status === JobStatus.Done && (
              <IconPhotoCheck size={20} stroke={1.5} />
            )}
            {jobDetails.status === JobStatus.Error && (
              <IconPhotoExclamation size={20} stroke={1.5} />
            )}
            {jobDetails.status === JobStatus.Processing && (
              <IconPhotoDown size={20} stroke={1.5} />
            )}
            {jobDetails.status === JobStatus.Queued && (
              <IconPhotoDown size={20} stroke={1.5} />
            )}
            {jobDetails.status === JobStatus.Requested && (
              <IconPhotoDown size={20} stroke={1.5} />
            )}
            <div className="font-normal">
              {jobDetails.images_completed} / {jobDetails.images_requested}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.cardProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${pctComplete}%` }}
            ></div>
          </div>
          <div className={styles.progressText}>
            <div>{prettyEta(jobDetails.wait_time)}</div>
            {pctComplete}%
          </div>
        </div>
      </div>
    </Section>
  );
};

export default PendingImageCard;
