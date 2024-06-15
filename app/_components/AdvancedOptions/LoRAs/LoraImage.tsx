/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import styles from './loraSearch.module.css'
import { Embedding, SavedLora } from '@/app/_data-models/Civitai'
import LoraDetails from './LoraDetails'
import NiceModal from '@ebay/nice-modal-react'
import { IconBox } from '@tabler/icons-react'
import { AppSettings } from '@/app/_data-models/AppSettings'

interface LoraImageProps {
  onUseLoraClick?: (savedLora: SavedLora) => void
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

const LoraImageV2 = ({ onUseLoraClick = () => {}, image }: LoraImageProps) => {
  if (!image) return null

  const baseFilters = AppSettings.get('civitAiBaseModelFilter')
  const aspectRatio = image.width / image.height
  const paddingTop = `${(1 / aspectRatio) * 100}%`

  return (
    <div
      className={styles['image-item']}
      onClick={() => {
        NiceModal.show('embeddingDetails', {
          children: (
            <LoraDetails
              details={image.details}
              onUseLoraClick={onUseLoraClick}
            />
          ),
          id: 'LoraDetails'
        })
      }}
      style={{ paddingTop }}
    >
      <img
        src={image.src}
        alt={image.name}
        style={{
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

export default LoraImageV2
