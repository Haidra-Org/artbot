import { AppConstants } from '@/app/_data-models/AppConstants'
import React, { useState, useEffect, useCallback, useRef } from 'react'

interface TypewriterProps {
  text: string
  onComplete: () => void
}

const Typewriter: React.FC<TypewriterProps> = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const typingRef = useRef(false)

  const typeText = useCallback((index: number = 0) => {
    if (!typingRef.current) return
    if (index < text.length) {
      setDisplayedText(text.substring(0, index + 1))
      setTimeout(() => typeText(index + 1), AppConstants.TYPING_SPEED_MS)
    } else {
      typingRef.current = false
      onComplete()
    }
  }, [text, onComplete])

  useEffect(() => {
    typingRef.current = true
    typeText()
    return () => {
      typingRef.current = false
    }
  }, [text, typeText])

  useEffect(() => {
    const cursorBlink = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorBlink)
  }, [])

  return (
    <div
      className="p-2 mb-4 font-mono w-full bg-slate-600 text-white max-w-[768px]"
      style={{ textAlign: 'left' }}
    >
      {'> '}
      {displayedText}
      <span style={{ opacity: showCursor ? 1 : 0 }}>|</span>
    </div>
  )
}

export default Typewriter