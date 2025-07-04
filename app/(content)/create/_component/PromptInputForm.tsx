'use client';
import { Accordion, AccordionItem as Item } from '@szhsin/react-accordion';
import {
  IconArrowBackUp,
  IconArrowBarLeft,
  IconBook,
  IconChevronDown,
  IconCodePlus,
  IconDeviceFloppy,
  IconFolder,
  IconPlaylistAdd,
  IconPlaylistX,
  IconTags
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import ReactTextareaAutosize from 'react-textarea-autosize';
import { AppSettings } from '@/app/_data-models/AppSettings';
import useUndoPrompt from '@/app/_hooks/useUndoPrompt';
import { useInput } from '@/app/_providers/PromptInputProvider';
import Button from '@/app/_components/Button';
import NiceModal from '@ebay/nice-modal-react';
import PromptLibrary from '@/app/_components/PromptLibrary';
import { addPromptToDexie } from '@/app/_db/promptsHistory';
import { toastController } from '@/app/_controllers/toastController';
import StyleTags from '@/app/_components/StyleTags';
import LoraKeywords from '@/app/_components/AdvancedOptions/LoRAs/LoraKeywords';

const AccordionItem = ({
  children,
  header,
  initialEntered,
  style,
  ...rest
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  initialEntered?: boolean;
  style?: React.CSSProperties;
}) => (
  <Item
    {...rest}
    initialEntered={initialEntered}
    style={style}
    header={({ state: { isEnter } }) => (
      <>
        <IconChevronDown
          className={`transition-transform duration-200 ease-out text-white ${
            isEnter && 'rotate-180'
          }`}
        />
        {header}
      </>
    )}
    buttonProps={{
      className: () => `flex w-full py-2 text-left`
    }}
    contentProps={{
      className: 'transition-height duration-200 ease-out'
    }}
  >
    {children}
  </Item>
);

export default function PromptInputForm() {
  const [undoPrompt, setUndoPrompt, undoNegative, setUndoNegative] =
    useUndoPrompt();
  const { input, setInput } = useInput();
  const [openNegativePrompt, setOpenNegativePrompt] = useState(false);

  const StyleTagsWrapper = useCallback(() => {
    return <StyleTags input={input} setInput={setInput} />;
  }, [input, setInput]);

  useEffect(() => {
    const negOpen = AppSettings.get('negativePanelOpen') || false;
    setOpenNegativePrompt(negOpen);
  }, []);

  let hasTrainedWords = false;

  input.loras.forEach((embedding) => {
    if (!embedding || !embedding.modelVersions || embedding.isArtbotManualEntry)
      return false;

    if (
      embedding.modelVersions.some(
        (modelVersion) => modelVersion.trainedWords.length > 0
      )
    ) {
      hasTrainedWords = true;
    }
  });

  // Now do the same for input.tis
  input.tis.forEach((t) => {
    if (t.inject_ti === 'prompt' || t.inject_ti === 'negprompt') {
      return false;
    }

    if (t?.tags?.length > 0) {
      hasTrainedWords = true;
    }
  });

  return (
    <div className="col bg-[#1d4d74] w-full rounded-md p-2">
      <div className="col gap-1">
        <div className="row font-bold text-sm text-white">
          <IconPlaylistAdd /> Prompt
        </div>
        <div>
          <ReactTextareaAutosize
            className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
            placeholder="Describe the image you want to generate"
            minRows={3}
            maxRows={8}
            onChange={(e) => {
              if (e.target.value) {
                setUndoPrompt('');
              }

              setInput({ prompt: e.target.value });
            }}
            style={{
              height: 80
            }}
            value={input.prompt}
          />
        </div>
        <div className="row w-full justify-between">
          <div className="row gap-2">
            {hasTrainedWords && (
              <Button
                className="h-[36px]!"
                onClick={() => {
                  NiceModal.show('modal', {
                    children: <LoraKeywords input={input} setInput={setInput} />
                  });
                }}
                title="Suggested keywords from LoRA or TIs"
                style={{
                  width: '36px'
                }}
              >
                <IconCodePlus stroke={1.5} />
              </Button>
            )}
            <Button
              className="h-[36px]!"
              onClick={() => {
                NiceModal.show('modal', {
                  children: (
                    <PromptLibrary
                      setPrompt={(prompt) => {
                        setUndoPrompt(input.prompt);
                        setInput({ prompt });
                      }}
                    />
                  ),
                  modalStyle: {
                    maxWidth: '1024px',
                    width: 'calc(100% - 32px)'
                  }
                });
              }}
              title="Recently used prompts"
            >
              <span className="row gap-1">
                <IconBook stroke={1.5} /> <span>Prompts</span>
              </span>
            </Button>
            <Button
              className="h-[36px]!"
              onClick={() => {
                NiceModal.show('modal', {
                  children: <StyleTagsWrapper />,
                  modalClassName: 'w-full md:min-w-[640px] max-w-[648px]'
                });
              }}
              title="Suggested tags to help add additional styles to an image"
            >
              <span className="row gap-1">
                <IconTags stroke={1.5} /> <span>Tags</span>
              </span>
            </Button>
          </div>
          <div className="row">
            <Button
              className="h-[36px]!"
              type="button"
              theme="danger"
              disabled={!input.prompt && !undoPrompt}
              onClick={() => {
                if (undoPrompt) {
                  setUndoPrompt('');
                  setInput({ prompt: undoPrompt });
                } else {
                  window.scrollTo(0, 0);
                  setUndoPrompt(input.prompt);
                  setInput({ prompt: '' });
                }
              }}
            >
              <span className="row gap-1">
                {undoPrompt ? (
                  <>
                    <IconArrowBackUp stroke={1.5} /> <span>Undo</span>{' '}
                  </>
                ) : (
                  <>
                    <IconArrowBarLeft stroke={1.5} /> <span>Clear</span>
                  </>
                )}
              </span>
            </Button>
          </div>
        </div>
      </div>
      <div className="col gap-1">
        <Accordion transition transitionTimeout={150}>
          <AccordionItem
            header={
              <div
                className="row font-bold text-sm gap-1 text-white"
                onClick={() => {
                  AppSettings.set(
                    'negativePanelOpen',
                    openNegativePrompt ? false : true
                  );
                  setOpenNegativePrompt(openNegativePrompt ? false : true);
                }}
              >
                <IconPlaylistX /> Negative prompt{' '}
                <span className="text-xs font-normal">(optional)</span>
              </div>
            }
            style={{
              marginBottom: '-8px'
            }}
            initialEntered={openNegativePrompt}
          >
            <div className="mb-[8px]">
              <div>
                <ReactTextareaAutosize
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
                  placeholder="Words to de-prioritize from the image"
                  minRows={3}
                  maxRows={8}
                  onChange={(e) => {
                    setInput({ negative: e.target.value });
                  }}
                  style={{
                    height: 80
                  }}
                  value={input.negative}
                />
              </div>
              <div className="row w-full justify-between">
                <div className="row gap-2">
                  <Button
                    disabled={!input.negative.trim()}
                    className="h-[36px]!"
                    onClick={async () => {
                      if (input.negative.trim() === '') return;
                      await addPromptToDexie({
                        prompt: input.negative,
                        promptType: 'negative'
                      });

                      toastController({
                        message: 'Negative prompt saved!',
                        type: 'success'
                      });
                    }}
                    title="Save negative prompt for future use"
                  >
                    <span className="row gap-1">
                      <IconDeviceFloppy stroke={1.5} /> <span>Save</span>
                    </span>
                  </Button>
                  <Button
                    className="h-[36px]!"
                    onClick={() => {
                      NiceModal.show('modal', {
                        children: (
                          <PromptLibrary
                            setPrompt={(prompt) => {
                              setUndoNegative(input.negative);
                              setInput({ negative: prompt });
                            }}
                            type="negative"
                          />
                        ),
                        modalStyle: {
                          maxWidth: '1024px',
                          width: 'calc(100% - 32px)'
                        }
                      });
                    }}
                    title="Load previously saved negative prompt"
                  >
                    <span className="row gap-1">
                      <IconFolder stroke={1.5} /> <span>Load</span>
                    </span>
                  </Button>
                </div>
                <div className="row">
                  <Button
                    className="h-[36px]!"
                    theme="danger"
                    disabled={!input.negative && !undoNegative}
                    onClick={() => {
                      if (undoNegative) {
                        setUndoNegative('');
                        setInput({ negative: undoNegative });
                      } else {
                        window.scrollTo(0, 0);
                        setUndoNegative(input.negative);
                        setInput({ negative: '' });
                      }
                    }}
                  >
                    <span className="row gap-1">
                      {undoNegative ? (
                        <>
                          <IconArrowBackUp stroke={1.5} /> <span>Undo</span>{' '}
                        </>
                      ) : (
                        <>
                          <IconArrowBarLeft stroke={1.5} /> <span>Clear</span>
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
