import { makeStore } from 'statery'

interface AppStoreInterface {
  buildId: string
  online: boolean
}

export const AppStore = makeStore<AppStoreInterface>({
  buildId: '',
  online: true
})

export const setAppBuildId = (update: string) => {
  AppStore.set(() => ({ buildId: update }))
}

export const setAppOnlineStatus = (update: boolean) => {
  AppStore.set(() => ({ online: update }))
}
