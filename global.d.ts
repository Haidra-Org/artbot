interface Blob {
  toPNG(callback?: () => void): Promise<Blob | undefined>
  toWebP(callback?: () => void): Promise<Blob | undefined>
  toJPEG(callback?: () => void): Promise<Blob | undefined>
  addOrUpdateExifData(userComment: string): Promise<Blob>
}

declare global {}
