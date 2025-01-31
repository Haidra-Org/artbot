const statusApi = process.env.ARTBOT_STATUS_API;

export async function GET() {
  try {
    const response = await fetch(`${statusApi}/images/total`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching images total:', error);
    return Response.json(
      { error: 'Failed to fetch images total' },
      { status: 500 }
    );
  }
}
