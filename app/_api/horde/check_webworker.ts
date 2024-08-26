self.onmessage = async (event) => {
  const { jobId, url, headers } = event.data

  try {
    const res = await fetch(url, { headers, cache: 'no-store' })
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
    self.postMessage({
      jobId,
      result: {
        success: false,
        statusCode: 0,
        message: 'unknown error'
      }
    })
  }
}
