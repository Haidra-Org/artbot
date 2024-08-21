'use client'
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, useRef } from 'react'

interface ImageItem {
  url: string
  title: string
}

interface CarouselProps {
  images: ImageItem[]
  width?: number
  height?: number
}

const AdvancedImageCarousel: React.FC<CarouselProps> = ({
  images,
  width = 768,
  height = 512
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [title, setTitle] = useState('')
  const [showImage, setShowImage] = useState(false)
  const typingRef = useRef(false) // Track typing state
  const erasingRef = useRef(false) // Track erasing state
  const [showCursor, setShowCursor] = useState(true)

  const typeTitle = useCallback((text: string, index: number = 0) => {
    if (!typingRef.current) return
    if (index < text.length) {
      setTitle(text.substring(0, index + 1))
      setTimeout(() => typeTitle(text, index + 1), 75)
    } else {
      typingRef.current = false
      setTimeout(() => setShowImage(true), 150) // Delay before showing the image
    }
  }, [])

  const eraseTitle = useCallback(() => {
    if (!erasingRef.current) return
    const eraseNextChar = () => {
      setTitle((prev) => {
        if (prev.length > 0) {
          setTimeout(eraseNextChar, 50)
          return prev.slice(0, -1)
        } else {
          erasingRef.current = false
          setTimeout(() => {
            const nextIndex =
              currentIndex + 1 >= images.length ? 0 : currentIndex + 1
            setCurrentIndex(nextIndex)
          }, 1500) // Delay before moving to the next element
          return ''
        }
      })
    }
    eraseNextChar()
  }, [currentIndex, images.length])

  useEffect(() => {
    if (!typingRef.current && showImage) {
      const imageTimer = setTimeout(() => {
        setShowImage(false)
        erasingRef.current = true
        setTimeout(eraseTitle, 1000) // Delay before erasing the title
      }, 4000) // Duration image is shown
      return () => clearTimeout(imageTimer)
    }
  }, [showImage, eraseTitle])

  useEffect(() => {
    if (!erasingRef.current && !typingRef.current && !showImage) {
      typingRef.current = true
      typeTitle(images[currentIndex].title)
    }
  }, [currentIndex, images, showImage, typeTitle])

  // Start the cycle immediately
  useEffect(() => {
    typingRef.current = true
    typeTitle(images[0].title)
  }, [images, typeTitle])

  // Cursor blink effect
  useEffect(() => {
    const cursorBlink = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(cursorBlink)
  }, [])

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className="p-2 mb-4 font-mono w-full bg-slate-600 text-white max-w-[768px]"
        style={{ textAlign: 'left' }}
      >
        {'> '}
        {title}
        <span style={{ opacity: showCursor ? 1 : 0 }}>|</span>
      </div>
      <div className="relative" style={{ width, height }}>
        <div
          className="absolute inset-0 bg-noise"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            opacity: showImage ? 0 : 1,
            transition: 'opacity 2s ease-in-out'
          }}
        />
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: showImage ? 1 : 0,
            transition: 'opacity 2s ease-in-out'
          }}
        />
      </div>
    </div>
  )
}

export default AdvancedImageCarousel
