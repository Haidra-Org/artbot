'use client'

import { useCallback, useEffect, useState } from 'react'
import Section from '../../Section'
import Select from '../../Select'
import OptionLabel from '../OptionLabel'
import { SelectOption } from '../../ComboBox'
import { IconArrowBarLeft } from '@tabler/icons-react'
import Button from '../../Button'
import { useInput } from '@/app/_providers/PromptInputProvider'
import { WorkflowPosition } from '@/app/_types/ArtbotTypes'

export const QrCodeOptionsArray = [
  { value: '', label: 'None' },
  {
    value: 'enabled',
    label: 'Enabled'
  }
]

export const QrCodePosition = [
  { value: 'center', label: 'centered' },
  { value: 'top left', label: 'top left' },
  { value: 'top right', label: 'top right' },
  { value: 'bottom left', label: 'bottom left' },
  { value: 'bottom right', label: 'bottom right' }
]

export default function AddWorkflow() {
  const { input, setInput } = useInput()
  const [qrCodeOption, setQrCodeOption] = useState<SelectOption>({
    value: '',
    label: 'None'
  })
  const [qrCodeText, setQrCodeText] = useState<string>('')
  const [qrCodePosition, setQrCodePosition] = useState<SelectOption>({
    value: 'center',
    label: 'Centered'
  })

  const handleEditWorkflow = useCallback(
    (text: string, newPosition: WorkflowPosition) => {
      const { workflows = [] } = input
      let found = false

      const updatedArray = workflows.map((workflow) => {
        if (workflow.type === 'qr_code') {
          found = true
          return { ...workflow, text, position: newPosition }
        }
        return workflow
      })

      if (!found) {
        updatedArray.push({
          type: 'qr_code',
          position: newPosition,
          text
        })
      }

      setInput({ workflows: updatedArray })
    },
    [input, setInput]
  )

  const handleWorkflowChange = (option: SelectOption) => {
    const { workflows = [] } = input

    if (!option.value) {
      setInput({ workflows: workflows.filter((w) => w.type !== 'qr_code') })
      setQrCodeOption({ value: '', label: 'None' })
      setQrCodeText('')
      setQrCodePosition({ value: 'center', label: 'centered' })
      return
    } else if (option.value === 'enabled') {
      setQrCodeOption({ value: 'enabled', label: 'Enabled' })
      setInput({
        workflows: [
          ...workflows,
          { type: 'qr_code', position: 'center', text: '' }
        ]
      })
      return
    }
  }

  useEffect(() => {
    if (input.workflows.length > 0) {
      // Filter input.workflows to see if any workflows are of type 'qr_code'
      const qrCodeWorkflow = input.workflows.find((w) => w.type === 'qr_code')
      if (qrCodeWorkflow) {
        setQrCodeOption({ value: 'enabled', label: 'Enabled' })
        setQrCodeText(qrCodeWorkflow.text)
        setQrCodePosition({
          value: qrCodeWorkflow.position,
          label: qrCodeWorkflow.position
        })
      }
    }
  }, [input.workflows])

  return (
    <Section anchor="workflows">
      <div className="row justify-between">
        <h2 className="row font-bold text-white">Workflows</h2>
      </div>
      <div className="w-full">
        <OptionLabel
          className="row md:row"
          title={
            <span className="row font-bold text-sm text-white gap-1">
              QR Code
            </span>
          }
        >
          <Select
            onChange={(option: SelectOption) => handleWorkflowChange(option)}
            options={QrCodeOptionsArray}
            value={{ ...qrCodeOption }}
          />
        </OptionLabel>
        {qrCodeOption.value === 'enabled' && (
          <div className="rounded bg-[#1d4d74] p-2 col mt-2">
            <label
              className={
                'col md:row justify-between gap-2 font-bold text-sm text-white'
              }
            >
              QR Code Text
            </label>
            <div className="w-full row">
              <input
                className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const target = e.target as HTMLInputElement
                  setQrCodeText(target.value)
                  handleEditWorkflow(
                    target.value,
                    qrCodePosition.value as WorkflowPosition
                  )
                }}
                placeholder="Enter text or URL"
                value={qrCodeText}
              />
              <div className="row gap-1">
                <Button
                  disabled={qrCodeText === ''}
                  theme="danger"
                  title="Clear text field"
                  onClick={() => {
                    setQrCodeText('')
                    handleEditWorkflow(
                      '',
                      qrCodePosition.value as WorkflowPosition
                    )
                  }}
                >
                  <IconArrowBarLeft />
                </Button>
              </div>
            </div>
            <label
              className={
                'col md:row justify-between gap-2 font-bold text-sm mt-2 text-white'
              }
            >
              QR Code Position
            </label>
            <Select
              onChange={(option: SelectOption) => {
                setQrCodePosition(option)
                handleEditWorkflow(qrCodeText, option.value as WorkflowPosition)
              }}
              options={QrCodePosition}
              value={{ ...qrCodePosition }}
            />
          </div>
        )}
      </div>
    </Section>
  )
}
