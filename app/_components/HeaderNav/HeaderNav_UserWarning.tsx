'use client'

import { UserStore } from '@/app/_stores/UserStore'
import ForceWorkerModal from '@/app/create/_component/ForceWorkerModal'
import NiceModal from '@ebay/nice-modal-react'
import { IconAlertTriangleFilled } from '@tabler/icons-react'
import { useStore } from 'statery'

export default function HeaderNavUserWarning() {
  const { forceSelectedWorker } = useStore(UserStore)

  if (!forceSelectedWorker) return null

  return (
    <div
      style={{ color: 'orange', cursor: 'pointer' }}
      onClick={() => {
        if (forceSelectedWorker) {
          NiceModal.show('modal', {
            children: <ForceWorkerModal />,
            modalClassName: 'max-w-[640px]'
          })
        }
      }}
    >
      <IconAlertTriangleFilled stroke={1} />
    </div>
  )
}
