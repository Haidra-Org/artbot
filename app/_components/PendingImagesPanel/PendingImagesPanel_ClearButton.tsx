import {
  CloseButton,
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/react'
import Button from '../Button'
import { IconClearAll } from '@tabler/icons-react'
import { PendingImagesStore } from '@/app/_stores/PendingImagesStore'
import { JobStatus } from '@/app/_types/ArtbotTypes'
import { deleteJobFromDexie } from '@/app/_db/jobTransactions'
import DropdownMenu from '../DropdownMenu'
import { MenuHeader, MenuItem } from '@szhsin/react-menu'

export default function ClearButton() {
  const clearDone = () => {
    PendingImagesStore.set((state) => ({
      pendingImages: state.pendingImages.filter(
        (job) => job.status !== JobStatus.Done
      )
    }))
  }

  const clearWaiting = () => {
    PendingImagesStore.set((state) => ({
      pendingImages: state.pendingImages.filter((job) => {
        if (job.status === JobStatus.Waiting) {
          deleteJobFromDexie(job.artbot_id)
        }
        return job.status !== JobStatus.Waiting
      })
    }))
  }

  const clearError = () => {
    PendingImagesStore.set((state) => ({
      pendingImages: state.pendingImages.filter((job) => {
        if (job.status === JobStatus.Error) {
          deleteJobFromDexie(job.artbot_id)
        }
        return job.status !== JobStatus.Error
      })
    }))
  }

  const clearAll = () => {
    clearDone()
    clearWaiting()
    clearError()
  }

  return (
    <DropdownMenu
      menuButton={
        <Button
          as="div"
          onClick={() => {}}
          style={{ height: '38px', width: '38px' }}
        >
          <IconClearAll />
        </Button>
      }
      shift={-120}
    >
      <MenuHeader>Clear pending images</MenuHeader>
      <MenuItem onClick={clearAll}>All</MenuItem>
      <MenuItem onClick={clearDone}>Done</MenuItem>
      <MenuItem onClick={clearWaiting}>Pending</MenuItem>
      <MenuItem onClick={clearError}>Error</MenuItem>
    </DropdownMenu>
  )
}
