'use client'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Modal as ResponsiveModal } from 'react-responsive-modal'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { IconX } from '@tabler/icons-react'

import 'react-responsive-modal/styles.css'
import styles from './modal.module.css'
import clsx from 'clsx'

interface ModalProps {
  children: ReactNode
  fullscreen?: boolean
  id?: string
  modalClassName?: string
  modalStyle?: React.CSSProperties
  onClose: () => void
}

// Global modal stack
let modalStack: string[] = []

function Modal({
  children,
  fullscreen = false,
  id,
  modalClassName = '',
  modalStyle = {},
  onClose = () => {}
}: ModalProps) {
  const ref = useRef(null)
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
    if (modal.visible) {
      if (!modalStack.includes(modal.id)) {
        modalStack.push(modal.id)
        window.history.pushState({ modalId: modal.id }, '')
      }
    } else {
      modalStack = modalStack.filter((id) => id !== modal.id)
      if (modalStack.length > 0) {
        window.history.replaceState(
          { modalId: modalStack[modalStack.length - 1] },
          ''
        )
      }
    }

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as { modalId?: string } | null
      if (!state || !state.modalId || state.modalId !== modal.id) {
        handleClose()
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [modal.id, modal.visible, handleClose])

  useEffect(() => {
    if (fullscreen) {
      setCloseOnEsc(false)
    } else if (!fullscreen) {
      const timer = setTimeout(() => setCloseOnEsc(true), 250)
      return () => clearTimeout(timer)
    }
  }, [fullscreen])

  useEffect(() => {
    closeOnEscRef.current = closeOnEsc
  }, [closeOnEsc])

  return (
    <ResponsiveModal
      center
      classNames={{
        root: styles.CustomModalContainer,
        modal: clsx(styles.CustomModal, modalClassName),
        closeButton: styles.CustomCloseButton
      }}
      initialFocusRef={ref}
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
      <div ref={ref}>{children}</div>
    </ResponsiveModal>
  )
}

export default NiceModal.create(Modal)
