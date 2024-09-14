import React from 'react';
import styles from './PendingImageCard.module.css';
import { appBasepath } from '@/app/_utils/browserUtils';
import Section from '../../Section';
import { IconPhotoDown, IconX } from '@tabler/icons-react'; // Import the Tabler Icon
import { JobStatus } from '@/app/_types/ArtbotTypes';
import PendingImageOverlayV2 from '../PendingImageOverlayV2';

interface CardProps {
  model: string;
  steps: number;
  sampler: string;
  progress: number; // Progress value between 0 and 100
  imagesCompleted: number;
  imagesRequested: number;
  status: JobStatus;
  eta?: number;
  timestamp: Date;
  onClose: () => void; // Function to handle the close action
}

const PendingImageCard: React.FC<CardProps> = ({
  model,
  steps,
  sampler,
  progress,
  imagesCompleted,
  imagesRequested,
  status,
  eta,
  timestamp,
  onClose
}) => {
  const formattedTimestamp = timestamp.toLocaleString();

  const prettyEta = () => {
    if (typeof eta === 'undefined' || isNaN(eta)) {
      return '';
    }

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

  return (
    <Section>
      <div className="flex flex-col gap-0">
        {/* Header with Close Button and Image Count */}
        <div className={styles.cardHeader}>
          <button className={styles.closeButton} onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <div className={styles.cardTop}>
          <div className={styles.cardImage}>
            <PendingImageOverlayV2 status={status} />
            <div
              className={styles.placeholderImage}
              style={{ backgroundImage: `url(${appBasepath()}/tile.png)` }}
            ></div>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardImageDetails}>
              <div>
                <strong>Model:</strong> {model}
              </div>
              <div>
                <strong>Sampler:</strong> {sampler}
              </div>
              <div>
                <strong>Steps:</strong> {steps}
              </div>
            </div>

            <div className={styles.cardImageDetails}>
              <div className={styles.statusText}>
                <strong>Status:</strong> {status}
              </div>
              <div className={styles.timestampText}>{formattedTimestamp}</div>
            </div>
          </div>
        </div>

        {/* Status and Timestamp */}
        <div className={styles.cardStatus}>
          <div className={styles.imagesCount}>
            <IconPhotoDown size={20} stroke={1.5} />
            {imagesCompleted} / {imagesRequested}
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.cardProgress}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className={styles.progressText}>
            <div>{prettyEta()}</div>
            {progress}%
          </p>
        </div>
      </div>
    </Section>
  );
};

export default PendingImageCard;
