import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import ModelSelect from './modelSelectComponent'
import { useInput } from '@/app/_providers/PromptInputProvider'
import { useStore } from 'statery'
import PromptInput from '@/app/_data-models/PromptInput'

// Mock the necessary dependencies
jest.mock('@/app/_providers/PromptInputProvider')
jest.mock('statery')
jest.mock('@/app/_data-models/PromptInput')

jest.mock('../../ComboBox', () => ({
  __esModule: true,
  default: ({ onChange, options, value }: {
    onChange: (option: { value: string }) => void,
    options: Array<{ value: string, label: string }>,
    value: { value: string, label: string }
  }) => (
    <select
      data-testid="model-select"
      onChange={(e) => onChange({ value: e.target.value })}
      value={value.value}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}))

describe('ModelSelect', () => {
  const setInputMock = jest.fn()
  let mockInput: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockInput = {
      models: ['Initial Model'],
      clipskip: 1,
      loras: [],
      sampler: 'k_euler_a',
      steps: '20',
      cfg_scale: '7'
    }

      ; (useInput as jest.Mock).mockReturnValue({
        input: mockInput,
        setInput: setInputMock,
      })

      ; (useStore as jest.Mock).mockReturnValue({
        availableModels: [
          { name: 'Model 1', count: 5 },
          { name: 'PonyXL', count: 3 },
          { name: 'AlbedoBase XL (SDXL)', count: 2 },
        ],
        modelDetails: {
          'Model 1': { baseline: 'base1', version: 'v1' },
          'PonyXL': { baseline: 'base2', version: 'v2' },
          'AlbedoBase XL (SDXL)': { baseline: 'base3', version: 'v3' },
        },
      })

      ; (PromptInput.isDefaultPromptInput as jest.Mock).mockReturnValue(false)
      ; (PromptInput.setNonTurboDefaultPromptInput as jest.Mock).mockImplementation((input) => input)
      ; (PromptInput.setTurboDefaultPromptInput as jest.Mock).mockImplementation((input) => input)
  })

  it('updates input correctly when selecting a new model', () => {
    const { getByTestId } = render(<ModelSelect />)
    const select = getByTestId('model-select')

    // Test selecting a regular model
    fireEvent.change(select, { target: { value: 'Model 1' } })
    expect(setInputMock).toHaveBeenCalledWith(expect.objectContaining({
      models: ['Model 1'],
      modelDetails: { baseline: 'base1', version: 'v1' },
    }))

    // Test selecting a Pony model
    fireEvent.change(select, { target: { value: 'PonyXL' } })
    expect(setInputMock).toHaveBeenCalledWith(expect.objectContaining({
      models: ['PonyXL'],
      modelDetails: { baseline: 'base2', version: 'v2' },
      clipskip: 2,
    }))

    // Test selecting AlbedoBase XL (SDXL)
    mockInput.models = ['Some Non-SDXL Model']
      ; (PromptInput.isDefaultPromptInput as jest.Mock).mockReturnValue(true)
    fireEvent.change(select, { target: { value: 'AlbedoBase XL (SDXL)' } })
    expect(setInputMock).toHaveBeenCalledWith(expect.objectContaining({
      models: ['AlbedoBase XL (SDXL)'],
      modelDetails: { baseline: 'base3', version: 'v3' },
    }))
    expect(PromptInput.setTurboDefaultPromptInput).toHaveBeenCalled()
  })
})