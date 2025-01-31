/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react';
import { ImageBlobBuffer } from '../_data-models/ImageFile_Dexie';
import { bufferToBlob } from '../_utils/imageUtils';

const defaultImage =
  'data:image/gif;base64,R0lGODdhAQABAJEAAAAAAB8fH////wAAACH5BAkAAAMALAAAAAABAAEAAAICTAEAOw==';

const Image = ({
  alt = '',
  className,
  imageBlobBuffer,
  style
}: {
  alt?: string;
  className?: string;
  imageBlobBuffer?: ImageBlobBuffer;
  style?: React.CSSProperties;
}) => {
  const [imageUrl, setImageUrl] = useState<string>(defaultImage);

  useEffect(() => {
    if (!imageBlobBuffer) {
      setImageUrl(defaultImage);
      return;
    }
    const blob = bufferToBlob(imageBlobBuffer);
    const url = URL.createObjectURL(blob as Blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageBlobBuffer]);

  return <img alt={alt} className={className} src={imageUrl} style={style} />;
};

export default Image;
