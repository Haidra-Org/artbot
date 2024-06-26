import { useEffect, useState } from 'react'

const useImageBlobUrl = (imageBlob: Blob | undefined) => {
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    if (!imageBlob) {
      return
    }

    // Create an object URL for the blob
    const url = URL.createObjectURL(imageBlob)
    setImageUrl(url)

    // Cleanup function to revoke the object URL
    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [imageBlob])

  return imageUrl
}

export default useImageBlobUrl
