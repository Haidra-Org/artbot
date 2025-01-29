import TotalImagesGeneratedLive from './TotalImagesGeneratedLive';
const statusApi = process.env.ARTBOT_STATUS_API;

async function getImageCount() {
  const response = await fetch(`${statusApi}/images/total`, {
    cache: 'no-cache'
  });
  const data = await response.json();
  return data.totalCount || 0;
}

export default async function TotalImagesGenerated() {
  const initialCount = await getImageCount();

  if (initialCount === 0) {
    return null;
  }

  return <TotalImagesGeneratedLive initialCount={initialCount} />;
}
