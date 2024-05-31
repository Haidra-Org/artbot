import { makeStore } from 'statery'
import { HordeUser } from '../_types/HordeTypes'

interface UserStoreInterface {
  userDetails: HordeUser
}

export const UserStore = makeStore<UserStoreInterface>({
  userDetails: {} as HordeUser
})

export const updateUser = (user: HordeUser) => {
  UserStore.set(() => ({ userDetails: user }))
}
