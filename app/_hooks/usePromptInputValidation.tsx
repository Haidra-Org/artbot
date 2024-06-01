import { useEffect, useState } from 'react'
import { useInput } from '../_providers/PromptInputProvider'
import { SourceProcessing } from '../_types/HordeTypes'

interface PromptError {
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

    if (input.prompt.length > 1000) {
      updateErrors.push({
        message: 'Prompt is too long. Max 1000 characters.',
        type: 'warning'
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
