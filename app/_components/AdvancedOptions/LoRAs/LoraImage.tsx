/* eslint-disable @next/next/no-img-element */
import { Embedding } from '@/app/_types/CivitaiTypes'
import { IconBox } from '@tabler/icons-react'
import useIntersectionObserver from '@/app/_hooks/useIntersectionObserver'
import LoraDetails from './LoraDetails'
import NiceModal from '@ebay/nice-modal-react'
import { useState } from 'react'
import Spinner from '../../Spinner'

interface LoraImageProps {
  columnWidth?: number // Optional prop to receive columnWidth
  photo: {
    key: string
    name: string
    baseModel: string
    src: string
    width: number
    height: number
    details: Embedding
  }
}

export default function LoraImage({ columnWidth, photo }: LoraImageProps) {
  const calculatedWidth = columnWidth
    ? Math.min(columnWidth, photo.width)
    : photo.width
  const calculatedHeight = photo.height * (calculatedWidth / photo.width)
  const [loading, setLoading] = useState(true)
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>(
    { threshold: 0.01 },
    '0px 0px 400px 0px', // Load when 100px below the viewport
    '400px 0px 0px 0px' // Unload when 100px above the viewport
  )

  const handleImageLoad = () => {
    setLoading(false)
  }

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: '#c2c2c2',
        display: 'flex',
        cursor: 'pointer',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        width: calculatedWidth,
        height: calculatedHeight
      }}
      onClick={() => {
        NiceModal.show('embeddingDetails', {
          children: (
            <LoraDetails
              details={photo.details}
              // onUseLoraClick={onUseLoraClick}
            />
          ),
          id: 'LoraDetails'
        })
      }}
    >
      {/* <Image
        src={photo.src}
        alt={photo.name}
        width={calculatedWidth}
        height={calculatedHeight}
      /> */}
      {loading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 row items-center justify-center text-center">
          <Spinner />
        </div>
      )}
      {isIntersecting && (
        <img
          src={photo.src}
          alt={photo.name}
          width={calculatedWidth}
          height={calculatedHeight}
          onLoad={() => {
            if (loading) {
              handleImageLoad()
            }
          }}
        />
      )}
      <div
        style={{
          alignItems: 'center',
          backgroundColor: 'black',
          bottom: '64px',
          color: 'white',
          display: 'flex',
          flexDirection: 'row',
          fontSize: '12px',
          fontWeight: 'bold',
          gap: '8px',
          height: '24px',
          padding: '4px',
          left: 0,
          position: 'absolute',
          opacity: 0.9
        }}
      >
        <IconBox stroke={1} />
        {photo.baseModel}
      </div>
      <div
        className="row items-center justify-center font-bold text-xs px-2 text-center"
        style={{
          backdropFilter: 'blur(10px)',
          bottom: 0,
          height: '64px',
          left: 0,
          position: 'absolute',
          right: 0
        }}
      >
        <div className="text-white font-bold z-10">{photo.name}</div>
        <div
          className="z-1"
          style={{
            backgroundColor: 'black',
            opacity: 0.4,
            bottom: 0,
            height: '64px',
            left: 0,
            position: 'absolute',
            right: 0
          }}
        ></div>
      </div>
    </div>
  )
}

// interface LoraImageProps {
//   alt: string
//   src: string
//   containerWidth: number
//   width: number
//   height: number
// }
// export default function LoraImage({
//   alt,
//   containerWidth,
//   src,
//   width,
//   height
// }: LoraImageProps) {
//   const [loading, setLoading] = useState(true)

//   const handleImageLoad = () => {
//     setLoading(false)
//   }

//   console.log(`containerWidth?`, containerWidth)

//   // eslint-disable-next-line jsx-a11y/alt-text
//   return <img src={src} />

//   return (
//     <div style={{ position: 'relative' }}>
//       {loading && (
//         <div
//           style={{
//             width: '100%',
//             height: '100%',
//             backgroundColor: '#424242',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             zIndex: 1 // Ensure the placeholder is above the image
//           }}
//         >
//           {/* You can add a spinner or any loading indicator here */}
//           {/* <span>Loading...</span> */}
//         </div>
//       )}
//       <img
//         alt={alt}
//         style={{
//           width,
//           height,
//           marginBottom: '0 !important',
//           opacity: loading ? 0 : 1, // Initial opacity 0 for fade-in effect
//           transition: 'opacity 0.5s ease-in-out', // Transition effect for fading
//           position: 'absolute', // Position absolutely to match placeholder position
//           top: 0,
//           left: 0,
//           visibility: loading ? 'hidden' : 'visible'
//         }}
//         src={src}
//         onLoad={() => {
//           if (loading) {
//             handleImageLoad()
//           }
//         }}
//       />
//     </div>
//   )
// }
