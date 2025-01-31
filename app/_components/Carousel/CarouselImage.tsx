/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import Image from '../Image';
import { ImageBlobBuffer } from '@/app/_data-models/ImageFile_Dexie';

interface CarouselImageProps {
  imageBlobBuffer: ImageBlobBuffer;
  maxHeight?: number;
  maxWidth?: number;
}

const CarouselImage: React.FC<CarouselImageProps> = ({ imageBlobBuffer }) => {
  const [windowHeight, setWindowHeight] = useState<number>(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!imageBlobBuffer) return null;

  return (
    <Image
      imageBlobBuffer={imageBlobBuffer}
      alt="Carousel Slide"
      style={{
        maxWidth: '100%',
        maxHeight: `${windowHeight - 72}px`,
        width: 'auto',
        height: 'auto',
        objectFit: 'contain'
      }}
    />
  );
};

export default CarouselImage;
