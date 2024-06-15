/* eslint-disable @next/next/no-img-element */
import { IconBox } from '@tabler/icons-react'
import useIntersectionObserver from '@/app/_hooks/useIntersectionObserver'
import LoraDetails from './LoraDetails'
import NiceModal from '@ebay/nice-modal-react'
import { useState } from 'react'
import Spinner from '../../Spinner'
import { AppSettings } from '@/app/_data-models/AppSettings'
import { Embedding, SavedLora } from '@/app/_data-models/Civitai'

interface LoraImageProps {
  columnWidth?: number // Optional prop to receive columnWidth
  onUseLoraClick?: (savedLora: SavedLora) => void
  photo: {
    key: string
    name: string
    baseModel: string
    src: string
    width: number
    height: number
    details: Embedding
    nsfwLevel: number
  }
}

export default function LoraImage({
  columnWidth,
  onUseLoraClick,
  photo
}: LoraImageProps) {
  const [baseFilters] = useState(AppSettings.get('civitAiBaseModelFilter'))
  const calculatedWidth = columnWidth
    ? Math.min(columnWidth, photo.width)
    : photo.width
  let calculatedHeight = photo.height * (calculatedWidth / photo.width)
  const [loading, setLoading] = useState(true)
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>(
    { threshold: 0.01 },
    '0px 0px 400px 0px', // Load when 100px below the viewport
    '400px 0px 0px 0px' // Unload when 100px above the viewport
  )

  const handleImageLoad = () => {
    setLoading(false)
  }

  if (calculatedHeight < 300) {
    calculatedHeight += 64
  }

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: '#E6E6E6',
        display: 'flex',
        cursor: 'pointer',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative',
        width: calculatedWidth,
        height: calculatedHeight
      }}
      onClick={() => {
        NiceModal.show('embeddingDetails', {
          children: (
            <LoraDetails
              details={photo.details}
              onUseLoraClick={onUseLoraClick}
            />
          ),
          id: 'LoraDetails'
        })
      }}
    >
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
          style={{
            filter:
              !baseFilters.includes('NSFW') && photo.nsfwLevel > 6
                ? 'blur(12px)'
                : 'none'
          }}
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
