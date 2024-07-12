'use client'

import { AppStore } from '@/app/_stores/AppStore'
import { UserStore } from '@/app/_stores/UserStore'
import ForceWorkerModal from '@/app/create/_component/ForceWorkerModal'
import NiceModal from '@ebay/nice-modal-react'
import { IconAlertTriangleFilled, IconWifiOff } from '@tabler/icons-react'
import { useStore } from 'statery'

export default function HeaderNavUserWarning() {
  const { online } = useStore(AppStore)
  const { forceSelectedWorker } = useStore(UserStore)

  if (!forceSelectedWorker && online) return null

  return (
    <div className="row gap-2">
      {forceSelectedWorker && (
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
      )}
      {!online && (
        <div
          style={{ color: 'orange', cursor: 'pointer' }}
          onClick={() => {
            NiceModal.show('modal', {
              children: (
                <div className="col">
                  <h2 className="row font-bold">Connection error</h2>
                  ArtBot is currently having trouble conecting to its server.
                  You may encounter unexpected errors.
                </div>
              ),
              modalClassName: 'max-w-[640px]'
            })
          }}
          title="ArtBot server is currently offline."
        >
          <IconWifiOff stroke={1.5} />
        </div>
      )}
    </div>
  )
}
