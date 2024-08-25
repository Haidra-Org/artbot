import { checkForWaitingJobs } from './checkForWaitingJobs'
import { checkPendingJobs } from './checkPendingJobs'

export const initJobController = () => {
  checkForWaitingJobs()
  checkPendingJobs()

  setInterval(() => {
    checkForWaitingJobs()
  }, 250)

  setInterval(() => {
    checkPendingJobs()
  }, 2000)
}
