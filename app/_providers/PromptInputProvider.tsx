'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState
} from 'react'

// import { ImageFileInterface } from '@/app/_data-models/dexie/ImageFile'
// import { getImagesForArtbotJobFromDexie } from '@/app/_db/imageFiles'
import PromptInput from '../_data-models/PromptInput'
import { debounce } from '../_utils/debounce'

// TODO: REMOVE ME. This is temporary placeholder for Dexie methods
interface ImageFileInterface {
  name: string
}

// TODO: REMOVE ME. This is temporary placeholder for Dexie methods
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getImagesForArtbotJobFromDexie = async (str: string) => {
  return [{ name: str }]
}

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
  }, [])

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
