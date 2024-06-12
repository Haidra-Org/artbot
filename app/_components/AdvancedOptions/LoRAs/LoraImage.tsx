/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'

interface LoraImageProps {
  alt: string
  imageProps: {
    src: string
    style?: React.CSSProperties
  }
  width: number
  height: number
}
export default function LoraImage({
  alt,
  imageProps,
  width,
  height
}: LoraImageProps) {
  const { src, style, ...restImageProps } = imageProps

  const [loading, setLoading] = useState(true)

  const handleImageLoad = () => {
    setLoading(false)
  }

  return (
    <div style={{ width, height, position: 'relative', overflow: 'hidden' }}>
      {loading && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#424242',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1 // Ensure the placeholder is above the image
          }}
        >
          {/* You can add a spinner or any loading indicator here */}
          {/* <span>Loading...</span> */}
        </div>
      )}
      <img
        alt={alt}
        style={{
          ...style,
          width,
          height,
          marginBottom: '0 !important',
          opacity: loading ? 0 : 1, // Initial opacity 0 for fade-in effect
          transition: 'opacity 0.5s ease-in-out', // Transition effect for fading
          position: 'absolute', // Position absolutely to match placeholder position
          top: 0,
          left: 0,
          visibility: loading ? 'hidden' : 'visible'
        }}
        {...restImageProps}
        src={src}
        onLoad={() => {
          if (loading) {
            handleImageLoad()
          }
        }}
      />
    </div>
  )
}
