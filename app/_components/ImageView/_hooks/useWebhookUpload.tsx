import { useCallback, useEffect, useState } from 'react';
import { toastController } from '@/app/_controllers/toastController';
import { ImageRequest, WebhookUrl } from '@/app/_types/ArtbotTypes';
import { bufferToBlob } from '@/app/_utils/imageUtils';
import { ImageBlobBuffer } from '@/app/_data-models/ImageFile_Dexie';
import { getWebhookUrlsFromDexie } from '@/app/_db/appSettings';
import { createJsonAttachmentFromImageDetails } from '@/app/_utils/fileUtils';

/**
 * A custom hook that returns a callback for handling webhook clicks.
 *
 * @returns A function that accepts the webhook object, image blob buffer,
 *          image request, and image ID to send the image and parameters to the webhook.
 */
const useWebhookUpload = () => {
  const [webhookUrls, setWebhookUrls] = useState<WebhookUrl[]>([]);

  const handleWebhookClick = useCallback(
    async (
      webhookObj: WebhookUrl,
      imageBlobBuffer: ImageBlobBuffer | null,
      imageRequest: ImageRequest,
      imageId: string
    ) => {
      if (!imageBlobBuffer) return;

      // Convert the image buffer to a Blob.
      const imageBlob = bufferToBlob(imageBlobBuffer);
      // Create a JSON blob for the image parameters.
      const jsonBlob = createJsonAttachmentFromImageDetails(imageRequest);

      // Build the FormData object to include both file attachments.
      const formData = new FormData();
      formData.append('files[0]', imageBlob, `${imageId}.png`);
      formData.append('files[1]', jsonBlob, `${imageId}.json`);

      // Create a payload for the webhook.
      const payload = {
        username: 'ArtBot',
        content: `Image shared from ArtBot:\n\n${
          imageRequest.prompt.length > 1950
            ? imageRequest.prompt.substring(0, 1947) + '...'
            : imageRequest.prompt
        }`,
        attachments: [
          { id: 0, description: 'Generated image' },
          { id: 1, description: 'Generation parameters' }
        ]
      };
      formData.append('payload_json', JSON.stringify(payload));

      try {
        await fetch(webhookObj.url, {
          method: 'POST',
          body: formData
        });

        toastController({
          message: 'Image and parameters sent to webhook!'
        });
      } catch (error) {
        console.error('Error sending to webhook:', error);
        toastController({
          message: 'Failed to send to webhook.',
          type: 'error'
        });
      }
    },
    []
  );

  useEffect(() => {
    const fetchWebhookUrls = async () => {
      const webhookUrls = await getWebhookUrlsFromDexie();
      setWebhookUrls(webhookUrls);
    };
    fetchWebhookUrls();
  }, []);

  return { handleWebhookClick, webhookUrls };
};

export default useWebhookUpload;
