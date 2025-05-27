self.onmessage = async (event) => {
  const { jobId, url, headers } = event.data

  try {
    // Add AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000) // 25s timeout (less than TaskQueue's 30s)
    
    const res = await fetch(url, { 
      headers, 
      cache: 'no-store',
      signal: controller.signal 
    })
    clearTimeout(timeoutId)
    
    const statusCode = res.status
    const data = await res.json()

    if ('done' in data && 'is_possible' in data) {
      self.postMessage({
        jobId,
        result: {
          success: true,
          ...data
        }
      })
    } else {
      self.postMessage({
        jobId,
        result: {
          success: false,
          message: data.message,
          statusCode
        }
      })
    }
  } catch (error) {
    // Better error handling with specific abort error
    let message = 'unknown error'
    let statusCode = 0
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        message = 'Request timed out after 25 seconds'
        statusCode = 408 // Request Timeout
      } else {
        message = error.message
      }
    }
    
    self.postMessage({
      jobId,
      result: {
        success: false,
        statusCode,
        message
      }
    })
  }
}
