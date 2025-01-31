import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './fullscreen.module.css';

interface FullScreenModalProps {
  onClick?: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({
  onClose = () => {},
  onClick = () => {},
  children
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleEscape, { capture: true });
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className={styles['fullscreen-modal-overlay']} onClick={onClose}>
      <div
        className={styles['fullscreen-modal-content']}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
          onClose();
        }}
      >
        <button className={styles['fullscreen-modal-close']} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default FullScreenModal;
