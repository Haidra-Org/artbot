import { ImageParamsForHordeApi } from "@/app/_data-models/ImageParamsForHordeApi";
import PromptInput from "@/app/_data-models/PromptInput";
import { db } from "@/app/_db/dexie";
import { downloadZip } from "client-zip";

interface File {
  name: string
  input: Blob
  lastModified: Date
}

interface ImageData {
  filename: string;
  prompt: string;
  created: string;
}

const generateHtmlContent = (imageDataArray: ImageData[]) => {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ArtBot Image Viewer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        .container {
            max-width: 1280px;
            margin: 0 auto;
        }
        .image-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
            overflow: hidden;
        }
        .image-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            max-width: 1280px;
            margin: 0 auto;
        }
        .image-container img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            display: block;
        }
        .image-info {
            padding: 15px;
        }
        .prompt {
            font-size: 16px;
            margin-bottom: 10px;
        }
        .created-date {
            font-size: 14px;
            color: #666;
        }
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            .image-info {
                padding: 10px;
            }
            .prompt {
                font-size: 14px;
            }
            .created-date {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container" id="imageContainer"></div>

    <script>
        const imageData = ${JSON.stringify(imageDataArray)};

        function displayImages() {
            const container = document.getElementById('imageContainer');
            imageData.forEach(image => {
                const imageElement = document.createElement('div');
                imageElement.className = 'image-container';
                imageElement.innerHTML = \`
                    <div class="image-wrapper">
                        <img src="\${image.filename}" alt="\${image.prompt}">
                    </div>
                    <div class="image-info">
                        <div class="prompt">\${image.prompt}</div>
                        <div class="created-date">Created: \${image.created}</div>
                    </div>
                \`;
                container.appendChild(imageElement);
            });
        }

        displayImages();
    </script>
</body>
</html>
  `;

  return htmlContent;
};

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
    const imageDataArray: ImageData[] = [];

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

        const createdDate = jobDetails?.created_timestamp
          ? new Date(jobDetails.created_timestamp).toLocaleString()
          : '';

        // Add JSON file
        const jsonContent = JSON.stringify({
          filename: imageName,
          created: createdDate,
          ...raw.apiParams
        }, null, 2); // null and 2 for pretty formatting

        files.push({
          name: `${baseFileName}.json`,
          input: new Blob([jsonContent], { type: 'application/json' }),
          lastModified: new Date()
        });

        // Add image data for HTML generation
        imageDataArray.push({
          filename: imageName,
          prompt: imageRequest?.prompt || 'No prompt available',
          created: createdDate
        });
      }
    }

    if (files.length === 0) {
      alert('No valid images found for download');
      return;
    }

    // Generate HTML content
    const htmlContent = generateHtmlContent(imageDataArray);

    // Add HTML file to the files array
    files.push({
      name: 'index.html',
      input: new Blob([htmlContent], { type: 'text/html' }),
      lastModified: new Date()
    });

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