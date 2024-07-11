import { makeStore } from 'statery'

interface AppStoreInterface {
  online: boolean
}

export const AppStore = makeStore<AppStoreInterface>({
  online: true
})

export const setAppOnlineStatus = (update: boolean) => {
  AppStore.set(() => ({ online: update }))
}
