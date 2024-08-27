import { ImageParamsForHordeApi } from "@/app/_data-models/ImageParamsForHordeApi";
import PromptInput from "@/app/_data-models/PromptInput";
import { db } from "@/app/_db/dexie";
import { downloadZip } from "client-zip";

interface File {
  name: string
  input: Blob
  lastModified: Date
}

export const handleDownloadSelectedImages = async (selectedImages: string[]) => {
  if (selectedImages.length === 0) {
    alert('No images selected');
    return;
  }

  try {
    // Fetch image data for selected images
    const imageFiles = await db.imageFiles
      .where('image_id')
      .anyOf(selectedImages)
      .toArray();

    const fileNameCounts: { [key: string]: number } = {};
    const files: File[] = [];

    for (const imageFile of imageFiles) {
      if (imageFile.imageBlobBuffer) {
        const imageRequest = await db.imageRequests
          .where('artbot_id')
          .equals(imageFile.artbot_id)
          .first();

        const jobDetails = await db.hordeJobs
          .where('artbot_id')
          .equals(imageFile.artbot_id)
          .first();

        const safePrompt = imageRequest?.prompt
          ? imageRequest.prompt.slice(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase()
          : 'untitled';

        let baseFileName = `${safePrompt}`;

        if (baseFileName in fileNameCounts) {
          fileNameCounts[baseFileName]++;
          baseFileName += `_${fileNameCounts[baseFileName]}`;
        } else {
          fileNameCounts[baseFileName] = 1;
        }

        const imageName = `${baseFileName}.png`;

        // Add image file
        files.push({
          name: imageName,
          input: new Blob([imageFile.imageBlobBuffer.arrayBuffer], { type: 'image/png' }),
          lastModified: new Date()
        });

        const raw = await ImageParamsForHordeApi.build(
          {
            ...imageRequest,
            seed: (imageFile.seed as string) || imageFile.seed
          } as PromptInput,
          {
            hideBase64String: true
          }
        )

        delete raw.apiParams.workers
        delete raw.apiParams.worker_blacklist

        // Add JSON file
        const jsonContent = JSON.stringify({
          filename: imageName,
          created: jobDetails?.created_timestamp ? new Date(jobDetails?.created_timestamp).toLocaleString() : '',
          ...raw.apiParams
        }, null, 2); // null and 2 for pretty formatting

        files.push({
          name: `${baseFileName}.json`,
          input: new Blob([jsonContent], { type: 'application/json' }),
          lastModified: new Date()
        });
      }
    }

    if (files.length === 0) {
      alert('No valid images found for download');
      return;
    }

    // Generate the zip file
    const blob = await downloadZip(files as unknown as File[]).blob();

    // Create a formatted date string for the file name
    const now = new Date();
    const dateString = now.toISOString().replace(/[-:]/g, '.').slice(0, -5); // YYYY.MM.DD_hh.mm.ss
    const fileName = `artbot_${dateString}.zip`;

    // Create a download link and trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error creating zip file:', error);
    alert('An error occurred while creating the zip file');
  }
};