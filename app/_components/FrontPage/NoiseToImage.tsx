'use client';
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from 'react';
import Typewriter from './Typewriter';
import { AppConstants } from '@/app/_data-models/AppConstants';
import { appBasepath } from '@/app/_utils/browserUtils';

const FADE_DURATION_MS = 1500;
const IMAGE_DISPLAY_DURATION_MS = 5000;

interface ImageItem {
  url: string;
  title: string;
  model: string;
}

interface CarouselProps {
  images: ImageItem[];
  width?: number;
  height?: number;
}

const NoiseToImage: React.FC<CarouselProps> = ({
  images,
  width = 768,
  height = 512
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showImage, setShowImage] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  const handleTypewriterComplete = useCallback(() => {
    setIsTyping(false);
    setTimeout(() => setShowImage(true), AppConstants.TYPING_SPEED_MS * 2);
  }, []);

  const moveToNextImage = useCallback(() => {
    setTimeout(
      () => {
        setShowImage(false);
        setTimeout(() => {
          const nextIndex = (currentIndex + 1) % images.length;
          setCurrentIndex(nextIndex);
          setIsTyping(true);
        }, FADE_DURATION_MS);
      },
      (AppConstants.TYPING_SPEED_MS * images[currentIndex].title.length) / 2
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, images.length]);

  useEffect(() => {
    if (!isTyping && showImage) {
      const imageTimer = setTimeout(moveToNextImage, IMAGE_DISPLAY_DURATION_MS);
      return () => clearTimeout(imageTimer);
    }
  }, [isTyping, showImage, moveToNextImage]);

  return (
    <div className="flex flex-col items-center w-full">
      <Typewriter
        text={images[currentIndex].title}
        onComplete={handleTypewriterComplete}
      />
      <div
        className="relative w-full"
        style={{
          maxWidth: width,
          aspectRatio: `${width}/${height}`
        }}
      >
        <div
          className="absolute inset-0 bg-noise"
          style={{
            backgroundImage: `url(${appBasepath()}/random_noise.jpg)`,
            backgroundRepeat: 'repeat',
            backgroundSize: 'tile',
            opacity: showImage ? 0 : 1,
            transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`
          }}
        />
        <img
          src={images[currentIndex].url}
          alt={images[currentIndex].title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: showImage ? 1 : 0,
            transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`
          }}
        />
        <div
          className="absolute bottom-2 right-2 text-sm italic text-white px-2 py-1 rounded"
          style={{
            opacity: showImage ? 1 : 0,
            transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
          }}
        >
          {images[currentIndex].model}
        </div>
      </div>
    </div>
  );
};

export default NoiseToImage;
