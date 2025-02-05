import { ImageRequest } from '@/app/_types/ArtbotTypes';

/**
 * Creates a JSON Blob from the given ImageRequest.
 */
export const createJsonAttachmentFromImageDetails = (imageRequest: ImageRequest): Blob => {
  const prettyJson = JSON.stringify(imageRequest, null, 2);
  return new Blob([prettyJson], { type: 'application/json' });
};