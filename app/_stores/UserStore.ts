import { makeStore } from 'statery';
import { HordeUser, WorkerMessage } from '../_types/HordeTypes';

interface UserStoreInterface {
  forceAllowedWorkers: boolean;
  forceBlockedWorkers: boolean;
  forceSelectedWorker: boolean;
  hordeMessages: WorkerMessage[];
  userDetails: HordeUser;
  sharedKey: string;
}

export const UserStore = makeStore<UserStoreInterface>({
  forceAllowedWorkers: false,
  forceBlockedWorkers: false,
  forceSelectedWorker: false,
  hordeMessages: [],
  userDetails: {} as HordeUser,
  sharedKey: ''
});

export const setForceSelectedWorker = (val: boolean) => {
  UserStore.set(() => ({
    forceSelectedWorker: val
  }));
};

export const updateUseSharedKey = (key: string) => {
  UserStore.set(() => ({ sharedKey: key }));
};

export const updateUser = (user: HordeUser) => {
  UserStore.set(() => ({ userDetails: user }));
};

export const updateHordeMessages = (messages: WorkerMessage[]) => {
  UserStore.set((state) => ({
    hordeMessages: [
      ...state.hordeMessages,
      ...messages.filter(
        (message) =>
          !state.hordeMessages.some((existing) => existing.id === message.id)
      )
    ]
  }));
};

export const updateWorkerUsagePreference = ({
  forceAllowedWorkers,
  forceBlockedWorkers
}: {
  forceAllowedWorkers: boolean;
  forceBlockedWorkers: boolean;
}) => {
  UserStore.set(() => ({ forceAllowedWorkers, forceBlockedWorkers }));
};
