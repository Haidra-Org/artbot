import { useCallback } from 'react';
import { bufferToBlob } from '@/app/_utils/imageUtils';
import { toastController } from '@/app/_controllers/toastController';
import { ImageRequest } from '@/app/_types/ArtbotTypes';
import { ImageBlobBuffer } from '@/app/_data-models/ImageFile_Dexie';
import { createJsonAttachmentFromImageDetails } from '@/app/_utils/fileUtils';

/**
 * A custom hook that returns an `uploadToGoogleDrive` function.
 *
 * @returns A function that, when called with the image buffer, image request, and imageId,
 * performs the Google Drive upload.
 */
function useGoogleDriveUpload() {
  const uploadToGoogleDrive = useCallback(
    async (
      imageBlobBuffer: ImageBlobBuffer | null,
      imageRequest: ImageRequest,
      imageId: string
    ) => {
      try {
        // Check if we have a valid token
        const tokenObj = window.gapi.client.getToken();
        if (!tokenObj) {
          toastController({
            message: 'Please connect your Google Account in Settings first',
            type: 'error'
          });
          return;
        }

        if (!imageBlobBuffer) {
          toastController({
            message: 'No image data available',
            type: 'error'
          });
          return;
        }

        // Convert buffer to blobs
        const imageBlob = bufferToBlob(imageBlobBuffer);
        const jsonBlob = createJsonAttachmentFromImageDetails(imageRequest);

        // Get (or create) the folder ID for "ArtBot Images"
        let folderId: string;
        {
          const searchParams = {
            q: "name='ArtBot Images' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: 'files(id, name)',
            spaces: 'drive'
          };

          const folderSearchResponse =
            await window.gapi.client.drive.files.list(searchParams);

          if (
            folderSearchResponse.result.files &&
            folderSearchResponse.result.files.length > 0
          ) {
            folderId = folderSearchResponse.result.files[0].id;
          } else {
            // Create the folder if it doesn't exist
            const folderResponse = await window.gapi.client.drive.files.create({
              resource: {
                name: 'ArtBot Images',
                mimeType: 'application/vnd.google-apps.folder'
              },
              fields: 'id'
            });
            folderId = folderResponse.result.id;
          }
        }

        // Build the upload URL (Drive upload endpoint) and common headers
        const uploadUrl =
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        const accessToken = tokenObj.access_token;
        const headers = {
          Authorization: `Bearer ${accessToken}`
        };

        // ------------------------
        // Upload the Image File
        // ------------------------
        const imageMetadata = {
          name: `${imageId}.png`,
          parents: [folderId],
          mimeType: 'image/png'
        };

        const imageFormData = new FormData();
        imageFormData.append(
          'metadata',
          new Blob([JSON.stringify(imageMetadata)], {
            type: 'application/json'
          })
        );
        imageFormData.append('file', imageBlob);

        const imageResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers,
          body: imageFormData
        });

        if (!imageResponse.ok) {
          const errorDetails = await imageResponse.json();
          console.error('Image upload failed:', errorDetails);
          toastController({
            message: 'Failed to upload image file to Google Drive',
            type: 'error'
          });
          return;
        }

        // ------------------------
        // Upload the JSON Metadata File
        // ------------------------
        const jsonMetadata = {
          name: `${imageId}.json`,
          parents: [folderId],
          mimeType: 'application/json'
        };

        const jsonFormData = new FormData();
        jsonFormData.append(
          'metadata',
          new Blob([JSON.stringify(jsonMetadata)], {
            type: 'application/json'
          })
        );
        jsonFormData.append('file', jsonBlob);

        const jsonResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers,
          body: jsonFormData
        });

        if (!jsonResponse.ok) {
          const errorDetails = await jsonResponse.json();
          console.error('JSON upload failed:', errorDetails);
          toastController({
            message: 'Failed to upload JSON file to Google Drive',
            type: 'error'
          });
          return;
        }

        toastController({
          message: 'Successfully uploaded to Google Drive!',
          type: 'success'
        });
      } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        toastController({
          message: 'Failed to upload to Google Drive',
          type: 'error'
        });
      }
    },
    []
  );

  return uploadToGoogleDrive;
}

export default useGoogleDriveUpload;
