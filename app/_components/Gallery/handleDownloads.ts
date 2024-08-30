import { HordeApiParams, ImageParamsForHordeApi } from "@/app/_data-models/ImageParamsForHordeApi";
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
  created: string;
  data: Partial<HordeApiParams>
}

const MAX_PER_PAGE = 25;

const generateHtmlContent = (imageDataArray: ImageData[], pageNumber: number, totalPages: number) => {
  const generateDate = new Date().toLocaleString();
  const startIndex = (pageNumber - 1) * MAX_PER_PAGE;
  const endIndex = Math.min(startIndex + MAX_PER_PAGE, imageDataArray.length);
  const pageImages = imageDataArray.slice(startIndex, endIndex);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ArtBot | Saved Image Archive</title>
    <style>
body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f0f0f0;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        .header {
            background-color: #333;
            color: white;
            padding: 1rem;
            text-align: left;
        }
        .header h1 {
            margin: 0;
            font-size: 1.5rem;
        }
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 20px;
            flex-grow: 1;
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
        .footer {
            background-color: #333;
            color: white;
            text-align: center;
            padding: 1rem;
            margin-top: auto;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .footer p {
            margin: 5px 0;
        }
        .accordion {
            margin-bottom: 4px;
            margin-top: 10px;
        }
        .accordion-control {
            display: none;
        }
        .accordion-label {
          cursor: pointer;
            font-size: 14px;
            font-family: monospace;
            transition: 0.4s;
        }
        .accordion-label:hover {
            background-color: #ddd;
        }
        .accordion-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.2s ease-out;
            background-color: #f9f9f9;
        }
        .accordion-control:checked + .accordion-label + .accordion-content {
            max-height: 1000px;
        }
        .json-content {
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
        }
        .pagination {
            display: flex;
            justify-content: center;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .pagination {
            display: flex;
            justify-content: center;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .pagination a {
            color: black;
            padding: 8px 16px;
            text-decoration: none;
            transition: background-color .3s;
            border: 1px solid #ddd;
            margin: 0 4px;
        }
        .pagination a.active {
            background-color: #4CAF50;
            color: white;
            border: 1px solid #4CAF50;
        }
        .pagination a:hover:not(.active) {background-color: #ddd;}
    </style>
</head>
<body>
    <header class="header">
        <h1>ArtBot | Saved Image Archive</h1>
    </header>
    <div class="container" id="imageContainer"></div>
    <div class="pagination" id="pagination"></div>
    <footer class="footer">
        <p>Created using <a href="https://tinybots.net/artbot" target="_blank">ArtBot</a></p>
        <p>Generated on: ${generateDate}</p>
    </footer>

    <script>
        const imageData = ${JSON.stringify(pageImages)};
        const currentPage = ${pageNumber};
        const totalPages = ${totalPages};

        function displayImages() {
            const container = document.getElementById('imageContainer');
            imageData.forEach((image, index) => {
                const imageElement = document.createElement('div');
                imageElement.className = 'image-container';
                imageElement.innerHTML = \`
                    <div class="image-wrapper">
                        <img src="images/\${image.filename}" alt="\${image.data.prompt}">
                    </div>
                    <div class="image-info">
                        <div class="prompt">\${image.data.prompt}</div>
                        <div class="accordion">
                            <input type="checkbox" id="accordion-\${index}" class="accordion-control">
                            <label for="accordion-\${index}" class="accordion-label">[ Image Details ]</label>
                            <div class="accordion-content">
                                <pre class="json-content">\${JSON.stringify(image, null, 2)}</pre>
                            </div>
                        </div>
                        <div class="created-date">Created: \${image.created} | \${image.data.models[0]}</div>
                    </div>
                \`;
                container.appendChild(imageElement);
            });
        }

        function displayPagination() {
            const paginationContainer = document.getElementById('pagination');
            const pageRange = 2; // Number of pages to show before and after current page

            function addPageLink(page, text = page.toString()) {
                const pageLink = document.createElement('a');
                pageLink.href = page === 1 ? 'index.html' : \`page_\${page}.html\`;
                pageLink.textContent = text;
                if (page === currentPage) {
                    pageLink.classList.add('active');
                }
                if (page < 1 || page > totalPages) {
                    pageLink.classList.add('disabled');
                    pageLink.removeAttribute('href');
                }
                paginationContainer.appendChild(pageLink);
            }

            // Previous button
            addPageLink(currentPage - 1, 'Previous');

            // First page
            addPageLink(1);

            // Ellipsis or pages
            if (currentPage - pageRange > 2) {
                paginationContainer.appendChild(document.createTextNode('...'));
            } else {
                for (let i = 2; i < currentPage; i++) {
                    addPageLink(i);
                }
            }

            // Pages around current page
            for (let i = Math.max(currentPage - pageRange, 1); i <= Math.min(currentPage + pageRange, totalPages); i++) {
                if (i !== 1 && i !== totalPages) {
                    addPageLink(i);
                }
            }

            // Ellipsis or pages
            if (currentPage + pageRange < totalPages - 1) {
                paginationContainer.appendChild(document.createTextNode('...'));
            } else {
                for (let i = currentPage + 1; i < totalPages; i++) {
                    addPageLink(i);
                }
            }

            // Last page
            if (totalPages !== 1) {
                addPageLink(totalPages);
            }

            // Next button
            addPageLink(currentPage + 1, 'Next');
        }

        displayImages();
        displayPagination();
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
          name: `images/${imageName}`,
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
          name: `images/${baseFileName}.json`,
          input: new Blob([jsonContent], { type: 'application/json' }),
          lastModified: new Date()
        });

        // Add image data for HTML generation
        imageDataArray.push({
          filename: imageName,
          created: createdDate,
          data: { ...raw.apiParams }
        });
      }
    }

    if (files.length === 0) {
      alert('No valid images found for download');
      return;
    }

    // Sort imageDataArray by created date, most recent first
    imageDataArray.sort((a, b) => {
      const dateA = new Date(a.created);
      const dateB = new Date(b.created);
      return dateB.getTime() - dateA.getTime();
    });

    // Calculate total pages
    const totalPages = Math.ceil(imageDataArray.length / MAX_PER_PAGE);

    // Generate HTML content for each page
    for (let i = 1; i <= totalPages; i++) {
      const htmlContent = generateHtmlContent(imageDataArray, i, totalPages);
      const fileName = i === 1 ? 'index.html' : `page_${i}.html`;

      // Add HTML file to the files array
      files.push({
        name: fileName,
        input: new Blob([htmlContent], { type: 'text/html' }),
        lastModified: new Date()
      });
    }

    // Generate the zip file
    const blob = await downloadZip(files as unknown as File[]).blob();

    // Create a formatted date string for the file name using local time
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Extract date and time parts
    const [datePart, timePart] = formattedDate.split(', ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    // Construct the filename with the correct format
    const dateString = `${month}.${day}.${year}_${hour}.${minute}.${second}`;
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