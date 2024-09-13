import React from 'react';
import styles from './PendingImageCard.module.css';
import { appBasepath } from '@/app/_utils/browserUtils';
import Section from '../../Section';
import { IconX } from '@tabler/icons-react'; // Import the Tabler Icon

interface CardProps {
  model: string;
  steps: number;
  sampler: string;
  progress: number; // Progress value between 0 and 100
  imagesCompleted: number;
  imagesRequested: number;
  status: 'Waiting' | 'Requested' | 'Processing' | 'Done' | 'Error';
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
  timestamp,
  onClose
}) => {
  const formattedTimestamp = timestamp.toLocaleString();

  return (
    <Section className={styles.card}>
      {/* Header with Close Button and Image Count */}
      <div className={styles.cardHeader}>
        <div className={styles.statusText}>
          <strong>Status:</strong> {status}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <IconX size={18} />
        </button>
      </div>

      <div className={styles.cardTop}>
        <div className={styles.cardImage}>
          {/* Placeholder Image Div */}
          <div
            className={styles.placeholderImage}
            style={{ backgroundImage: `url(${appBasepath()}/tile.png)` }}
          ></div>
        </div>
        <div className={styles.cardContent}>
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
      </div>

      {/* Status and Timestamp */}
      <div className={styles.cardStatus}>
        <div className={styles.imagesCount}>
          {imagesCompleted} / {imagesRequested}
        </div>
        <div className={styles.timestampText}>
          {status === 'Done' || status === 'Error'
            ? 'Completed: '
            : 'Requested: '}
          {formattedTimestamp}
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
        <p className={styles.progressText}>{progress}%</p>
      </div>
    </Section>
  );
};

export default PendingImageCard;
