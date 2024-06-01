'use client'
import { Accordion, AccordionItem as Item } from '@szhsin/react-accordion'
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
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'
import { AppSettings } from '@/app/_data-models/AppSettings'
import useUndoPrompt from '@/app/_hooks/useUndoPrompt'
import { useInput } from '@/app/_providers/PromptInputProvider'
import Button from '@/app/_components/Button'

const AccordionItem = ({
  children,
  header,
  initialEntered,
  style,
  ...rest
}: {
  children: React.ReactNode
  header: React.ReactNode
  initialEntered?: boolean
  style?: React.CSSProperties
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
)

export default function PromptInputForm() {
  const [undoPrompt, setUndoPrompt, undoNegative, setUndoNegative] =
    useUndoPrompt()
  const { input, setInput } = useInput()
  const [openNegativePrompt, setOpenNegativePrompt] = useState(false)

  useEffect(() => {
    const negOpen = AppSettings.get('negativePanelOpen') || false
    setOpenNegativePrompt(negOpen)
  }, [])

  return (
    <div className="col bg-[#1d4d74] w-full rounded-md p-2">
      <div className="col gap-1">
        <div className="row font-bold text-sm text-white">
          <IconPlaylistAdd /> Prompt
        </div>
        <div>
          <ReactTextareaAutosize
            className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
            placeholder="Describe the image you want to generate..."
            minRows={3}
            maxRows={8}
            onChange={(e) => {
              if (e.target.value) {
                setUndoPrompt('')
              }

              setInput({ prompt: e.target.value })
            }}
            style={{
              height: 80
            }}
            value={input.prompt}
          />
        </div>
        <div className="row w-full justify-between">
          <div className="row gap-2">
            <Button
              className="!h-[36px]"
              onClick={() => {}}
              title="Suggested keywords from LoRA or TIs"
              style={{
                width: '36px'
              }}
            >
              <IconCodePlus stroke={1.5} />
            </Button>
            <Button
              className="!h-[36px]"
              onClick={() => {}}
              title="Recently used prompts"
            >
              <span className="row gap-1">
                <IconBook stroke={1.5} /> <span>Prompts</span>
              </span>
            </Button>
            <Button
              className="!h-[36px]"
              onClick={() => {}}
              title="Suggested tags to help add additional styles to an image"
            >
              <span className="row gap-1">
                <IconTags stroke={1.5} /> <span>Tags</span>
              </span>
            </Button>
            {/*
            // TODO: Move styles into advanced options area?
            */}
            {/* <ReactiveButton
              idleText={
                <span className="row gap-1">
                  <IconCamera stroke={1.5} /> <span>Styles</span>
                </span>
              }
              size="small"
              style={{
                borderRadius: '4px',
                padding: '0 6px'
              }}
            /> */}
          </div>
          <div className="row">
            <Button
              className="!h-[36px]"
              type="button"
              theme="danger"
              disabled={!input.prompt && !undoPrompt}
              onClick={() => {
                if (undoPrompt) {
                  setUndoPrompt('')
                  setInput({ prompt: undoPrompt })
                } else {
                  window.scrollTo(0, 0)
                  setUndoPrompt(input.prompt)
                  setInput({ prompt: '' })
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
                  )
                  setOpenNegativePrompt(openNegativePrompt ? false : true)
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
                  placeholder="Words to de-prioritize from the image..."
                  minRows={3}
                  maxRows={8}
                  onChange={(e) => {
                    setInput({ negative: e.target.value })
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
                    className="!h-[36px]"
                    onClick={() => {}}
                    title="Save negative prompt for future use"
                  >
                    <span className="row gap-1">
                      <IconDeviceFloppy stroke={1.5} /> <span>Save</span>
                    </span>
                  </Button>
                  <Button
                    className="!h-[36px]"
                    onClick={() => {}}
                    title="Load previously saved negative prompt"
                  >
                    <span className="row gap-1">
                      <IconFolder stroke={1.5} /> <span>Load</span>
                    </span>
                  </Button>
                </div>
                <div className="row">
                  <Button
                    className="!h-[36px]"
                    theme="danger"
                    disabled={!input.negative && !undoNegative}
                    onClick={() => {
                      if (undoNegative) {
                        setUndoNegative('')
                        setInput({ negative: undoNegative })
                      } else {
                        window.scrollTo(0, 0)
                        setUndoNegative(input.negative)
                        setInput({ negative: '' })
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
  )
}
