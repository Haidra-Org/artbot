import { useEffect, useState } from 'react'
import { useInput } from '../_providers/PromptInputProvider'
import { SourceProcessing } from '../_types/HordeTypes'
import { flattenKeywords } from '../_utils/arrayUtils'
import { AppSettings } from '../_data-models/AppSettings'

export interface PromptError {
  message: string
  type: 'critical' | 'warning'
}

export default function usePromptInputValidation(): [PromptError[], boolean] {
  const { input } = useInput()
  const [errors, setErrors] = useState<PromptError[]>([])
  const [hasCriticalError, setCriticalError] = useState(false)

  useEffect(() => {
    let updateCriticalError = false
    const updateErrors: PromptError[] = []

    // Check for LoRA or Embedding keywords
    const keywordTags: string[] = flattenKeywords(input.loras)
    let missingKeywords = keywordTags.length > 0 ? true : false
    keywordTags.forEach((tag) => {
      if (input.prompt.includes(tag)) {
        missingKeywords = false
      }
    })

    if (missingKeywords) {
      updateErrors.push({
        message: `Keyword for LoRA or embedding not found in prompt.`,
        type: 'warning'
      })
    }

    if (input.prompt.length > 1000 && AppSettings.get('useReplacementFilter')) {
      updateErrors.push({
        message: `Prompt is too long for replacement filter. Max 1,000 characters. Please shorten prompt or disable replacement filter. Current length: ${input.prompt.length}`,
        type: 'critical'
      })
    }

    // Remix is only availble with Stable Cascade 1.0
    if (
      input.models[0] !== 'Stable Cascade 1.0' &&
      input.source_processing === SourceProcessing.Remix
    ) {
      updateErrors.push({
        message: 'Remix option can only be used with "Stable Cascade models',
        type: 'critical'
      })
    }

    updateErrors.forEach((err) => {
      if (err.type === 'critical') {
        updateCriticalError = true
      }
    })

    setCriticalError(updateCriticalError)
    setErrors(updateErrors)
  }, [input])

  return [errors, hasCriticalError]
}
