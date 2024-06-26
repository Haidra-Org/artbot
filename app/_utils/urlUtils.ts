/* eslint-disable @typescript-eslint/no-explicit-any */
import pako from 'pako'

export const getBaseUrl = (): string => {
  const { protocol, host } = window.location
  const baseUrl = `${protocol}//${host}`

  // Check if the port is provided and add it to the URL
  // if (port) {
  //   baseUrl += `:${port}`
  // }

  return baseUrl
}

// Helper function to convert Uint8Array to a base64 string
export const uint8ArrayToBase64 = (array: Uint8Array): string => {
  let binary = ''
  const len = array.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i])
  }
  return btoa(binary)
}

// Helper function to convert a base64 string to Uint8Array
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binary = atob(base64)
  const len = binary.length
  const array = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return array
}

// Function to compress and encode a JSON object
export const compressAndEncode = (jsonObject: Record<string, any>): string => {
  const jsonString = JSON.stringify(jsonObject)
  const compressed = pako.deflate(jsonString)
  return uint8ArrayToBase64(compressed)
}

// Function to decode and decompress a base64 string
export const decodeAndDecompress = (
  encodedData: string
): Record<string, any> => {
  const compressed = base64ToUint8Array(encodedData)
  const jsonString = pako.inflate(compressed, { to: 'string' })
  return JSON.parse(jsonString)
}

// Function to get data from the URL hash
export const getHashData = (hash: string): string | null => {
  const params = new URLSearchParams(hash.slice(1)) // Remove the leading '#'
  return params.get('share')
}
