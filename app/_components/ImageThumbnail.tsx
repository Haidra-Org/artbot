'use client';

/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from 'react';
import { checkImageExistsInDexie } from '../_db/ImageFiles';
import { bufferToBlob } from '../_utils/imageUtils';
import { ImageBlobBuffer } from '../_data-models/ImageFile_Dexie';

const defaultImage =
  'data:image/gif;base64,R0lGODdhAQABAJEAAAAAAB8fH////wAAACH5BAkAAAMALAAAAAABAAEAAAICTAEAOw==';

interface ImageThumbnailProps {
  alt: string;
  artbot_id?: string;
  image_id?: string;
  square?: boolean;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({
  alt,
  artbot_id,
  image_id,
  square = false
}) => {
  const [imageUrl, setImageUrl] = useState(defaultImage);
  const imageLoaded = useRef(false);

  const fetchImage = async () => {
    if (imageLoaded.current) return;

    let dexieImage;
    if (artbot_id) {
      dexieImage = await checkImageExistsInDexie({ artbot_id });
    } else if (image_id) {
      dexieImage = await checkImageExistsInDexie({ image_id });
    }

    if (
      dexieImage &&
      dexieImage !== true &&
      'imageBlobBuffer' in dexieImage &&
      dexieImage.imageBlobBuffer
    ) {
      const blob = bufferToBlob(dexieImage.imageBlobBuffer as ImageBlobBuffer);
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      imageLoaded.current = true;
    }
  };

  useEffect(() => {
    fetchImage();

    return () => {
      if (imageUrl !== defaultImage) {
        URL.revokeObjectURL(imageUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artbot_id, image_id]);

  return (
    <img
      alt={alt}
      src={imageUrl}
      className={`w-full h-full ${square ? 'object-scale-down' : 'object-contain'}`}
      style={{ aspectRatio: square ? '1 / 1' : 'auto' }}
    />
  );
};

export default ImageThumbnail;
