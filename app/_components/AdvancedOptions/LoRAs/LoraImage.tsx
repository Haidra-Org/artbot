/* eslint-disable @next/next/no-img-element */
import React, { useRef } from 'react'
import styles from './loraSearch.module.css'
import {
  Embedding,
  SavedEmbedding,
  SavedLora
} from '@/app/_data-models/Civitai'
import LoraDetails from './LoraDetails'
import NiceModal from '@ebay/nice-modal-react'
import { IconBox } from '@tabler/icons-react'
import { AppSettings } from '@/app/_data-models/AppSettings'
import useResizeObserver from '@/app/_hooks/useResizeObserver'

interface LoraImageProps {
  civitAiType?: 'LORA' | 'TextualInversion'
  onUseLoraClick?: (savedLora: SavedEmbedding | SavedLora) => void
  image: {
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

const LoraImage = ({
  civitAiType = 'LORA',
  onUseLoraClick = () => {},
  image
}: LoraImageProps) => {
  const baseFilters = AppSettings.get('civitAiBaseModelFilter')
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useResizeObserver(containerRef)
  if (!image) return null

  // Maintain aspect ratio 320:400 -> 4:5
  const height = (containerWidth / 4) * 5

  return (
    <div
      className={styles['image-item']}
      onClick={() => {
        NiceModal.show('embeddingDetails', {
          children: (
            <LoraDetails
              civitAiType={civitAiType}
              details={image.details}
              onUseLoraClick={onUseLoraClick}
            />
          ),
          id: 'LoraDetails'
        })
      }}
      ref={containerRef}
      style={{
        width: '100%',
        height: `${height}px`,
        padding: 0,
        position: 'relative',
        maxHeight: '400px',
        maxWidth: '320px'
      }}
    >
      <img
        src={image.src}
        alt={image.name}
        style={{
          maxHeight: '400px',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter:
            !baseFilters.includes('NSFW') && image.nsfwLevel >= 7
              ? 'blur(12px)'
              : 'none'
        }}
      />
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
        {image.baseModel}
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
        <div className="text-white font-bold z-10">{image.name}</div>
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

export default LoraImage
