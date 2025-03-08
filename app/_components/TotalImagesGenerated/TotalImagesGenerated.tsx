import TotalImagesGeneratedLive from './TotalImagesGeneratedLive';
const statusApi = process.env.ARTBOT_STATUS_API;

async function getImageCount() {
  if (!statusApi) {
    console.log("ARTBOT_STATUS_API environment variable is not defined");
    return 0;
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${statusApi}/images/total`, {
      next: { revalidate: 5 },
      signal: controller.signal
    });
    const data = await response.json();
    clearTimeout(timeoutId);
    return data.totalCount || 0;
  } catch (error) {
    clearTimeout(timeoutId);
    console.log('Failed to fetch total image count:', error);
    return 0;
  }
}

export default async function TotalImagesGenerated() {
  const initialCount = await getImageCount();

  if (initialCount === 0) {
    return null;
  }

  return <TotalImagesGeneratedLive initialCount={initialCount} />;
}
