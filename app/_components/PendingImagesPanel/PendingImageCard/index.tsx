import React from 'react';
import styles from './PendingImageCard.module.css';
import tileImage from '../../../public/tile.png';
import { appBasepath } from '@/app/_utils/browserUtils';
import Section from '../../Section';

interface CardProps {
  model: string;
  steps: number;
  sampler: string;
  progress: number; // Progress value between 0 and 100
}

const PendingImageCard: React.FC<CardProps> = ({
  model,
  steps,
  sampler,
  progress
}) => {
  return (
    <Section>
      <div className={styles.cardTop}>
        <div className={styles.cardImage}>
          {/* Placeholder Image Div */}
          <div
            className={styles.placeholderImage}
            style={{ backgroundImage: `url(${appBasepath()}/tile.png)` }}
          >
            {/* Optional content inside the placeholder */}
          </div>
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
