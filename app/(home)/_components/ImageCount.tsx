'use client';

import { useEffect, useState } from 'react';

export default function ImageCount() {
  const [imageCount, setImageCount] = useState(0);

  const fetchImageCount = async () => {
    fetch('/api/status/counter/images')
      .then((response) => response.json())
      .then((data) => {
        if (data.totalCount) setImageCount(data.totalCount);
      });
  };

  useEffect(() => {
    fetchImageCount();
    const interval = setInterval(fetchImageCount, 5 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (imageCount === 0) {
    return null;
  }

  return (
    <span className="text-[20px]">
      ArtBot has been used to generate{' '}
      <span className="font-bold font-mono">{imageCount.toLocaleString()}</span>{' '}
      images.
    </span>
  );
}
