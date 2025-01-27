export default async function hordeHeartbeat(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      'https://aihorde.net/api/v2/status/heartbeat',
      {
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    return response.ok;
  } catch (error) {
    // Return false if there's a timeout, network error, or any other issue
    return false;
  }
}
