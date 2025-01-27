import { makeStore } from 'statery';

interface AppStoreInterface {
  buildId: string;
  hordeOnline: boolean;
  online: boolean;
}

export const AppStore = makeStore<AppStoreInterface>({
  buildId: '',
  hordeOnline: true,
  online: true
});

export const setAppBuildId = (update: string) => {
  AppStore.set(() => ({ buildId: update }));
};

export const setAppOnlineStatus = (update: boolean) => {
  AppStore.set(() => ({ online: update }));
};

export const setHordeOnlineStatus = (update: boolean) => {
  AppStore.set(() => ({ hordeOnline: update }));
};
