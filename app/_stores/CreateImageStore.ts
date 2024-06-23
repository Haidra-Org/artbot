import { makeStore } from 'statery'

interface ImageStoreInterface {
  inputUpdated: number
}

export const CreateImageStore = makeStore<ImageStoreInterface>({
  inputUpdated: Date.now()
})

/**
 * Update input timestamp
 * Used to force /create page to pull PromptInput changes from session store.
 * Useful when re-rolling or editing previous input.
 */
export const updateInputTimstamp = () => {
  CreateImageStore.set(() => ({ inputUpdated: Date.now() }))
}
