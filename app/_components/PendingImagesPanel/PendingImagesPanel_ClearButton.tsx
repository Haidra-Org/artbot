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
    <Popover className="relative">
      <PopoverButton as="div">
        <Button onClick={() => {}} style={{ height: '38px', width: '38px' }}>
          <IconClearAll />
        </Button>
      </PopoverButton>
      <PopoverPanel
        anchor="bottom"
        className="col bg-white dark:bg-black p-2 rounded-md w-[180px] mt-2"
        transition
        style={{
          border: '1px solid white'
        }}
      >
        <div className="text-sm font-bold">Clear pending images:</div>
        <CloseButton className="row w-full" onClick={clearAll}>
          All
        </CloseButton>
        <CloseButton className="row w-full" onClick={clearDone}>
          Done
        </CloseButton>
        <CloseButton className="row w-full" onClick={clearWaiting}>
          Pending
        </CloseButton>
        <CloseButton className="row w-full" onClick={clearError}>
          Error
        </CloseButton>
      </PopoverPanel>
    </Popover>
  )
}
