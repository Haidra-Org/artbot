import { Dispatch, SetStateAction, useState } from 'react'

export default function useUndoPrompt(): [
  string,
  Dispatch<SetStateAction<string>>,
  string,
  Dispatch<SetStateAction<string>>
] {
  const [undoPrompt, setUndoPrompt] = useState<string>('')
  const [undoNegative, setUndoNegative] = useState<string>('')

  return [undoPrompt, setUndoPrompt, undoNegative, setUndoNegative]
}
