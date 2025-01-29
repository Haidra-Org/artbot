import { HordeUser, WorkerMessage } from '../_types/HordeTypes';
import { UserStore, updateHordeMessages, updateUser } from './UserStore';

describe('UserStore', () => {
  it('should initialize with default values', () => {
    const userStore = UserStore.state;
    expect(userStore.userDetails).toEqual({} as HordeUser);
  });

  it('should update userDetails when updateUser is called', () => {
    const newUser: HordeUser = {
      username: 'testUser',
      id: 1,
      kudos: 100,
      concurrency: 5,
      worker_invited: 0,
      moderator: false,
      kudos_details: {
        accumulated: 50,
        gifted: 10,
        donated: 5,
        admin: 2,
        received: 30,
        recurring: 1,
        awarded: 2
      },
      worker_count: 1,
      worker_ids: ['worker1'],
      sharedkey_ids: [],
      trusted: true,
      flagged: false,
      vpn: false,
      service: false,
      education: false,
      special: false,
      pseudonymous: false,
      account_age: 365,
      usage: {
        megapixelsteps: null,
        requests: null
      },
      contributions: {
        megapixelsteps: null,
        fulfillments: null
      },
      records: {
        usage: {
          megapixelsteps: 100,
          tokens: 200
        },
        contribution: {
          megapixelsteps: 50,
          tokens: 100
        },
        fulfillment: {
          image: 10,
          text: 5,
          interrogation: 2
        },
        request: {
          image: 20,
          text: 10,
          interrogation: 5
        }
      }
    };

    updateUser(newUser);
    const userStore = UserStore.state;
    expect(userStore.userDetails).toEqual(newUser);
  });

  it('should initialize with empty horde messages array', () => {
    const userStore = UserStore.state;
    expect(userStore.hordeMessages).toEqual([]);
  });

  it('should append new messages when updateHordeMessages is called', () => {
    const initialMessage: WorkerMessage = {
      expiry: '2025-01-29T08:53:55.000Z',
      id: '123',
      message: 'Initial message',
      origin: 'Test Origin',
      user_id: '1'
    };

    const newMessage: WorkerMessage = {
      expiry: '2025-01-30T08:53:55.000Z',
      id: '456',
      message: 'New message',
      origin: 'Test Origin 2',
      user_id: '1'
    };

    updateHordeMessages([initialMessage]);
    expect(UserStore.state.hordeMessages).toEqual([initialMessage]);

    updateHordeMessages([newMessage]);
    expect(UserStore.state.hordeMessages).toEqual([initialMessage, newMessage]);
  });

  it('should not add duplicate messages when updateHordeMessages is called', () => {
    // Reset the store state
    UserStore.set(() => ({ hordeMessages: [] }));

    const message1: WorkerMessage = {
      expiry: '2025-01-29T08:53:55.000Z',
      id: '123',
      message: 'Test message',
      origin: 'Test Origin',
      user_id: '1'
    };

    const message2: WorkerMessage = {
      expiry: '2025-01-29T08:53:55.000Z',
      id: '123', // Same ID as message1
      message: 'Updated message', // Different message content
      origin: 'Test Origin',
      user_id: '1'
    };

    // Add the first message
    updateHordeMessages([message1]);
    expect(UserStore.state.hordeMessages).toEqual([message1]);

    // Try to add a message with the same ID
    updateHordeMessages([message2]);
    expect(UserStore.state.hordeMessages).toEqual([message1]); // Should still only contain the first message
    expect(UserStore.state.hordeMessages.length).toBe(1); // Length should still be 1
  });
});
