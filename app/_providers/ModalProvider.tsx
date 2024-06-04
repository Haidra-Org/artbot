'use client'

import NiceModal from '@ebay/nice-modal-react'
import { ReactNode } from 'react'
import Modal from '@/app/_components/Modal'

/**
 * We need to duplicate registration of "Modal" for the "delete" key
 * because the delete modal can / needs to appears on top of other modals
 * that may be open, otherwise, if the delete modal is opened using the
 * "modal" key, other modals using the "modal" key will be closed.
 */

NiceModal.register('delete', Modal)
NiceModal.register('modal', Modal)

export default function ModalProvider({ children }: { children: ReactNode }) {
  return <NiceModal.Provider>{children}</NiceModal.Provider>
}
