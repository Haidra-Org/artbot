'use client'

import { useEffect, useState } from 'react'
import PromptActionPanel from './PromptActionPanel'

export default function PromptStickyCreate() {
  const [isSticky, setIsSticky] = useState(false)

  const handleScroll = () => {
    const offset = window.scrollY
    const stickyThreshold = 100 // adjust this value as needed
    setIsSticky(offset > stickyThreshold)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`transition-opacity duration-300 ${isSticky ? 'sticky top-0 opacity-100' : 'opacity-0'}`}
    >
      <div className="row w-full items-center">
        <PromptActionPanel isSticky />
      </div>
    </div>
  )
}
