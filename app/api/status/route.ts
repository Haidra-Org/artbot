import { NextRequest } from 'next/server';
const statusApi = process.env.ARTBOT_STATUS_API;

export async function POST(request: NextRequest) {
  const { type } = await request.json();

  if (type === 'image_done' && statusApi) {
    fetch(`${statusApi}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'image',
        service: 'ArtBot_v2'
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }).catch((err) => {
      // Do nothing
    });
  }

  return Response.json({
    success: true
  });
}
