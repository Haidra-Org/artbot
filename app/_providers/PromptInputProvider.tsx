'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState
} from 'react'

import PromptInput from '../_data-models/PromptInput'
import { debounce } from '../_utils/debounce'
import { ImageFileInterface } from '../_data-models/ImageFile_Dexie'
import { getImagesForArtbotJobFromDexie } from '../_db/ImageFiles'
import { useStore } from 'statery'
import { CreateImageStore } from '../_stores/CreateImageStore'

type PromptInputContextType = {
  input: PromptInput
  setInput: React.Dispatch<Partial<PromptInput>>
  pageLoaded: boolean
  setPageLoaded: React.Dispatch<React.SetStateAction<boolean>>
  sourceImages: ImageFileInterface[]
  setSourceImages: React.Dispatch<React.SetStateAction<ImageFileInterface[]>>
}

type InputState = InstanceType<typeof PromptInput>
type InputAction = Partial<InputState>
type InputReducer = React.Reducer<InputState, InputAction>

interface PromptProviderProps {
  children: React.ReactNode
}

const defaultInputContext: PromptInputContextType = {
  input: {} as PromptInput,
  setInput: () => {},
  pageLoaded: false,
  setPageLoaded: () => {},
  sourceImages: [],
  setSourceImages: () => {}
}

const InputContext = createContext<PromptInputContextType>(defaultInputContext)

const updateSessionStorage = (value: string) => {
  sessionStorage.setItem('userInput', value)
}

const debouncedUpdate = debounce(updateSessionStorage, 300)

export const useInput = () => {
  return useContext(InputContext)
}

export const PromptInputProvider: React.FC<PromptProviderProps> = ({
  children
}) => {
  const { inputUpdated } = useStore(CreateImageStore)
  const [pageLoaded, setPageLoaded] = useState(false)

  const inputReducer: InputReducer = (
    state: PromptInput,
    newState: Partial<PromptInput>
  ) => {
    const updatedInputState = { ...state, ...newState }

    // Save input to session storage
    const jsonString = JSON.stringify(updatedInputState)
    debouncedUpdate(jsonString)

    return updatedInputState
  }

  const [input, setInput] = useReducer(inputReducer, new PromptInput())
  const [sourceImages, setSourceImages] = useState<ImageFileInterface[]>([])

  useEffect(() => {
    const retrievedString = sessionStorage.getItem('userInput')
    if (retrievedString) {
      const retrievedObject = JSON.parse(retrievedString)
      setInput(retrievedObject)
    }
  }, [inputUpdated])

  const loadUploadedImages = useCallback(async () => {
    const images = await getImagesForArtbotJobFromDexie(
      '__TEMP_USER_IMG_UPLOAD__'
    )
    setSourceImages(images)
  }, [])

  useEffect(() => {
    loadUploadedImages()
  }, [loadUploadedImages])

  return (
    <InputContext.Provider
      value={{
        input,
        setInput,
        pageLoaded,
        setPageLoaded,
        sourceImages,
        setSourceImages
      }}
    >
      {children}
    </InputContext.Provider>
  )
}
