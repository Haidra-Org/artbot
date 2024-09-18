import { useState, useEffect } from 'react';
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests';
import { ImageRequest } from '@/app/_types/ArtbotTypes';
import { ArtBotHordeJob } from '@/app/_data-models/ArtBotHordeJob';
import { useStore } from 'statery';
import { PendingImagesStore } from '../_stores/PendingImagesStore';

export function useImageRequestDetails(artbot_id: string) {
  const { pendingImages } = useStore(PendingImagesStore);
  const [imageDetails, setImageDetails] = useState<ImageRequest>();

  const jobDetails: ArtBotHordeJob | undefined = pendingImages.find(
    (image) => image.artbot_id === artbot_id
  );

  useEffect(() => {
    async function fetchData() {
      const [imageRequest] = await getImageRequestsFromDexieById([artbot_id]);

      setImageDetails(imageRequest);
    }

    fetchData();
  }, [artbot_id]);

  return { imageDetails, jobDetails };
}
