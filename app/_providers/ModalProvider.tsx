'use client'

import NiceModal from '@ebay/nice-modal-react'
import { ReactNode } from 'react'
import Modal from '@/app/_components/Modal'

NiceModal.register('delete', Modal)
NiceModal.register('modal', Modal)

export default function ModalProvider({ children }: { children: ReactNode }) {
  return <NiceModal.Provider>{children}</NiceModal.Provider>
}
