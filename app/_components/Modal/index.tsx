'use client'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Modal as ResponsiveModal } from 'react-responsive-modal'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { IconX } from '@tabler/icons-react'

import 'react-responsive-modal/styles.css'
import styles from './modal.module.css'

interface ModalProps {
  children: ReactNode
  fullscreen?: boolean
  id?: string
  modalStyle?: React.CSSProperties
  onClose: () => void
}

function Modal({
  children,
  fullscreen = false,
  id,
  modalStyle = {},
  onClose = () => {}
}: ModalProps) {
  const modal = useModal()

  const [closeOnEsc, setCloseOnEsc] = useState(true)
  const closeOnEscRef = useRef(closeOnEsc)

  const handleClose = useCallback(() => {
    if (!closeOnEscRef.current) {
      return
    }

    onClose()
    modal.hide()
  }, [onClose, modal])

  useEffect(() => {
    if (fullscreen) {
      setCloseOnEsc(false)
    } else if (!fullscreen) {
      setTimeout(() => setCloseOnEsc(true), 250)
    }
  }, [fullscreen])

  // Need to utilize ref here to handle enabling or disabling closeOnEsc
  useEffect(() => {
    closeOnEscRef.current = closeOnEsc
  }, [closeOnEsc])

  return (
    <ResponsiveModal
      center
      classNames={{
        root: styles.CustomModalContainer,
        modal: styles.CustomModal,
        closeButton: styles.CustomCloseButton
      }}
      modalId={id}
      styles={{
        modal: { ...modalStyle }
      }}
      open={modal.visible}
      onClose={() => {}}
      onEscKeyDown={handleClose}
      onOverlayClick={handleClose}
      closeIcon={
        <div
          className="text-black dark:text-white hover:primary-color"
          onClick={handleClose}
        >
          <IconX />
        </div>
      }
    >
      {children}
    </ResponsiveModal>
  )
}

export default NiceModal.create(Modal)
