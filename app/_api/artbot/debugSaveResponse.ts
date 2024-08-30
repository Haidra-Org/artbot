/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Saves API response data for debugging purposes on a local machine.
 *
 * This function sends a POST request to a local debug endpoint ('/api/debug/save-response')
 * with the provided API response data. It's designed to be attached to API requests
 * to log data for debugging and troubleshooting.
 *
 * @param id - A unique identifier for the API response
 * @param data - The API response data to be saved (can be of any type)
 * @param route - The API route that was called
 *
 * @example
 * // Usage in an API call:
 * const apiData = await fetchSomeApiData();
 * await debugSaveApiResponse('uniqueId123', apiData, '/api/some-endpoint');
 */
export const debugSaveApiResponse = async (
  id: string,
  data: any,
  route: string
) => {
  if (process.env.NEXT_PUBLIC_SAVE_DEBUG_LOGS !== 'true') return

  try {
    const response = await fetch('/api/debug/save-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, data, route })
    })

    if (!response.ok) {
      throw new Error('Failed to save API response')
    }

    console.log('API response saved successfully')
  } catch (error) {
    console.error('Error saving API response:', error)
  }
}
