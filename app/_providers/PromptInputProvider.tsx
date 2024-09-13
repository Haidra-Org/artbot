'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useReducer,
  useState
} from 'react';

import PromptInput from '../_data-models/PromptInput';
import { debounce } from '../_utils/debounce';
import { ImageFileInterface } from '../_data-models/ImageFile_Dexie';
import { getImagesForArtbotJobFromDexie } from '../_db/ImageFiles';
import { useStore } from 'statery';
import { CreateImageStore } from '../_stores/CreateImageStore';
import { decodeAndDecompress, getHashData } from '../_utils/urlUtils';
import { ImageParamsForHordeApi } from '../_data-models/ImageParamsForHordeApi';
import { AppSettings } from '../_data-models/AppSettings';
import { clientHeader } from '../_data-models/ClientHeader';
import { AppConstants } from '../_data-models/AppConstants';

type PromptInputContextType = {
  input: PromptInput;
  kudos: number;
  pageLoaded: boolean;
  setInput: React.Dispatch<Partial<PromptInput>>;
  setPageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  setSourceImages: React.Dispatch<React.SetStateAction<ImageFileInterface[]>>;
  sourceImages: ImageFileInterface[];
};

type InputState = InstanceType<typeof PromptInput>;
type InputAction = Partial<InputState>;
type InputReducer = React.Reducer<InputState, InputAction>;

interface PromptProviderProps {
  children: React.ReactNode;
}

const defaultInputContext: PromptInputContextType = {
  input: {} as PromptInput,
  kudos: 0,
  pageLoaded: false,
  setInput: () => {},
  setPageLoaded: () => {},
  setSourceImages: () => {},
  sourceImages: []
};

const InputContext = createContext<PromptInputContextType>(defaultInputContext);

const updateSessionStorage = (value: string) => {
  sessionStorage.setItem('userInput', value);
};

const debouncedUpdate = debounce(updateSessionStorage, 300);

export const useInput = () => {
  return useContext(InputContext);
};

export const PromptInputProvider: React.FC<PromptProviderProps> = ({
  children
}) => {
  const { inputUpdated } = useStore(CreateImageStore);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [kudos, setKudos] = useState(0);
  const [sourceImages, setSourceImages] = useState<ImageFileInterface[]>([]);

  const kudosTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUpdatedKudos = useCallback(
    async (input: PromptInput) => {
      if (kudosTimeoutRef.current) {
        clearTimeout(kudosTimeoutRef.current);
      }

      kudosTimeoutRef.current = setTimeout(async () => {
        try {
          const { apiParams } = await ImageParamsForHordeApi.build(input);
          apiParams.dry_run = true;

          if (!input.prompt.trim() && !input.negative.trim() && kudos > 0) {
            return;
          } else if (
            !input.prompt.trim() &&
            !input.negative.trim() &&
            kudos === 0
          ) {
            apiParams.prompt = '_';
          }

          const apikey =
            AppSettings.apikey()?.trim() || AppConstants.AI_HORDE_ANON_KEY;
          const response = await fetch(
            `https://aihorde.net/api/v2/generate/async`,
            {
              body: JSON.stringify(apiParams),
              cache: 'no-store',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Client-Agent': clientHeader(),
                apikey: apikey
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            setKudos(data.kudos);
          } else {
            console.error('Failed to fetch kudos:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching kudos:', error);
        }
      }, 1050);
    },
    [kudos]
  );

  const inputReducer: InputReducer = (
    state: PromptInput,
    newState: Partial<PromptInput>
  ) => {
    const updatedInputState = { ...state, ...newState };

    // Save input to session storage
    const jsonString = JSON.stringify(updatedInputState);
    debouncedUpdate(jsonString);

    // Call kudos API
    fetchUpdatedKudos(updatedInputState);

    return updatedInputState;
  };

  const [input, setInput] = useReducer(inputReducer, new PromptInput());

  useEffect(() => {
    const retrievedString = sessionStorage.getItem('userInput');
    if (retrievedString) {
      const retrievedObject = JSON.parse(retrievedString);
      setInput(retrievedObject);
    }
  }, [inputUpdated]);

  const loadUploadedImages = useCallback(async () => {
    const images = await getImagesForArtbotJobFromDexie(
      AppConstants.IMAGE_UPLOAD_TEMP_ID
    );
    setSourceImages(images);
  }, []);

  useEffect(() => {
    loadUploadedImages();
  }, [loadUploadedImages]);

  useEffect(() => {
    const windowHash = window.location.hash;
    if (windowHash.startsWith('#share=')) {
      const hashData = getHashData(window.location.hash) || '';
      const formData = decodeAndDecompress(hashData);

      // Cleanup properties that are automatically created
      // when adding to the database.
      delete formData.id;
      delete formData.artbot_id;

      setInput({ ...formData });
    }
    // We only want this to run once, on initial page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InputContext.Provider
      value={{
        input,
        kudos,
        pageLoaded,
        setInput,
        setPageLoaded,
        setSourceImages,
        sourceImages
      }}
    >
      {children}
    </InputContext.Provider>
  );
};
