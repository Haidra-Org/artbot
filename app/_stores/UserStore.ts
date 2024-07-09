import { makeStore } from 'statery'
import { HordeUser } from '../_types/HordeTypes'

interface UserStoreInterface {
  forceAllowedWorkers: boolean
  forceBlockedWorkers: boolean
  forceSelectedWorker: boolean
  userDetails: HordeUser
}

export const UserStore = makeStore<UserStoreInterface>({
  forceAllowedWorkers: false,
  forceBlockedWorkers: false,
  forceSelectedWorker: false,
  userDetails: {} as HordeUser
})

export const setForceSelectedWorker = (val: boolean) => {
  UserStore.set(() => ({
    forceSelectedWorker: val
  }))
}

export const updateUser = (user: HordeUser) => {
  UserStore.set(() => ({ userDetails: user }))
}

export const updateWorkerUsagePreference = ({
  forceAllowedWorkers,
  forceBlockedWorkers
}: {
  forceAllowedWorkers: boolean
  forceBlockedWorkers: boolean
}) => {
  UserStore.set(() => ({ forceAllowedWorkers, forceBlockedWorkers }))
}
