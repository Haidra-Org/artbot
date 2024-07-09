import { useStore } from 'statery'
import { IconPhoto, IconPhotoCheck } from '@tabler/icons-react'
import Link from 'next/link'
import {
  PendingImagesStore,
  viewedPendingPage
} from '../../_stores/PendingImagesStore'

export default function HeaderNavPendingJobs() {
  const { completedJobsNotViewed, pendingImages } = useStore(PendingImagesStore)

  if (pendingImages.length === 0 && completedJobsNotViewed === 0) {
    return null
  }

  return (
    <div>
      <Link
        href="/pending"
        onClick={() => {
          viewedPendingPage()
        }}
      >
        <div className="relative text-black dark:text-white">
          {pendingImages.length === 0 ? (
            <IconPhotoCheck stroke={1} />
          ) : (
            <IconPhoto stroke={1} />
          )}
          {completedJobsNotViewed > 0 && (
            <span
              className="text-white"
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
                fontWeight: '700',
                fontFamily: 'monospace'
              }}
            >
              {completedJobsNotViewed}
            </span>
          )}
        </div>
      </Link>
    </div>
  )
}
