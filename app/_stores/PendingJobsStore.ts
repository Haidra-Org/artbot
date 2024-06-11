import { makeStore } from 'statery'

interface PendingJobsStoreInterface {
  completedJobs: number
  pendingJobs: number
  pendingJobCompletedTimestamp: number
  pendingPageTimestamp: number
}

export const PendingJobsStore = makeStore<PendingJobsStoreInterface>({
  completedJobs: 0,
  pendingJobs: 0,
  pendingJobCompletedTimestamp: 0,
  pendingPageTimestamp: Date.now()
})

export const updateCompletedJobInPendingStore = () => {
  // In this instance, the user is on a larger screen device and can see the pending images panel.
  if (window.innerWidth >= 768 && window.location.pathname === '/create') {
    return
  }

  PendingJobsStore.set((state) => ({
    completedJobs: state.completedJobs + 1,
    pendingJobCompletedTimestamp: Date.now()
  }))
}

export const updatePendingJobsStore = ({
  completedJobs,
  pendingJobs,
  pendingJobCompletedTimestamp,
  pendingPageTimestamp
}: Partial<PendingJobsStoreInterface>) => {
  const update: Partial<PendingJobsStoreInterface> = {}

  if (typeof completedJobs !== 'undefined' && completedJobs >= 0) {
    update.completedJobs = completedJobs
  }

  if (typeof pendingJobs !== 'undefined' && pendingJobs >= 0) {
    update.pendingJobs = pendingJobs
  }

  if (
    typeof pendingJobCompletedTimestamp !== 'undefined' &&
    pendingJobCompletedTimestamp >= 0
  ) {
    update.pendingJobCompletedTimestamp = pendingJobCompletedTimestamp
  }

  if (
    typeof pendingPageTimestamp !== 'undefined' &&
    pendingPageTimestamp >= 0
  ) {
    update.pendingPageTimestamp = pendingPageTimestamp
  }

  PendingJobsStore.set(() => ({ ...update }))
}
