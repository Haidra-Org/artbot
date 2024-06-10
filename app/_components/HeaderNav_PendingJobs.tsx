import { useStore } from 'statery'
import {
  PendingJobsStore,
  updatePendingJobsStore
} from '../_stores/PendingJobsStore'
import { IconPhotoCheck } from '@tabler/icons-react'
import Link from 'next/link'

export default function HeaderNavPendingJobs() {
  const { completedJobs, pendingJobCompletedTimestamp, pendingPageTimestamp } =
    useStore(PendingJobsStore)

  if (
    completedJobs === 0 ||
    pendingJobCompletedTimestamp < pendingPageTimestamp
  ) {
    return null
  }

  return (
    <div>
      <Link
        href="/create"
        onClick={() => {
          updatePendingJobsStore({
            completedJobs: 0,
            pendingPageTimestamp: Date.now()
          })
        }}
      >
        <div className="relative">
          <IconPhotoCheck stroke={1.5} />
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-5px',
              backgroundColor: 'red',
              borderRadius: '8px',
              fontSize: '10px',
              height: '14px',
              padding: '0 4px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '500',
              fontFamily: 'monospace'
            }}
          >
            {completedJobs}
          </span>
        </div>
      </Link>
    </div>
  )
}
