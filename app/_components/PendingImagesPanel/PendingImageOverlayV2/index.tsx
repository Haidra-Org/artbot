import React from 'react';
import { IconAlertTriangle, IconPhotoUp } from '@tabler/icons-react';

import styles from './PendingImageOverlayV2.module.css';
import { JobStatus } from '@/app/_types/ArtbotTypes';
import ParticleAnimation from '../../ParticleAnimation';

interface PendingImageOverlayProps {
  status: JobStatus;
}

const PendingImageOverlayV2: React.FC<PendingImageOverlayProps> = ({
  status
}) => {
  return (
    <div className={styles.pendingImageOverlay}>
      {status === JobStatus.Waiting && (
        <>
          <div className={styles.imageStatusIcon}>
            <IconPhotoUp size={40} stroke={1} color="white" />
          </div>
        </>
      )}
      {status === JobStatus.Requested && (
        <>
          <div className={styles.imageStatusIcon}>
            <IconPhotoUp size={40} stroke={1} color="white" />
          </div>
        </>
      )}
      {status === JobStatus.Queued || status === JobStatus.Processing ? (
        <div className={styles.imageStatusIcon}>
          <ParticleAnimation />
        </div>
      ) : null}
      {status === JobStatus.Error && (
        <div className={styles.imageStatusIcon}>
          <IconAlertTriangle size={48} stroke={1} color="rgb(234, 179, 8)" />
        </div>
      )}
    </div>
  );
};

export default React.memo(PendingImageOverlayV2);
