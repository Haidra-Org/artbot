'use client';

import { useEffect, useState } from 'react';

export default function TotalImagesGeneratedLive({
  initialCount
}: {
  initialCount: number;
}) {
  const [imageCount, setImageCount] = useState(initialCount);

  const fetchImageCount = async () => {
    try {
      const response = await fetch('/api/status/counter/images', {
        cache: 'no-store'
      });
      const data = await response.json();
      if (data.totalCount) setImageCount(data.totalCount);
    } catch (error) {
      console.error('Error fetching image count:', error);
    }
  };

  useEffect(() => {
    fetchImageCount();

    const interval = setInterval(() => {
      fetchImageCount();
    }, 2000);

    return () => {
      clearInterval(interval);
    };
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
