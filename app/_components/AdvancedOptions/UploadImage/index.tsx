'use client'
import { useDropzone } from 'react-dropzone'

import { useCallback } from 'react'
import { nanoid } from 'nanoid'
import { IconPhotoPlus, IconX } from '@tabler/icons-react'

import {
  base64toBlob,
  cropToNearest64,
  getBase64
} from '@/app/_utils/imageUtils'

import styles from './uploadImage.module.css'
import {
  ImageFileInterface,
  ImageStatus,
  ImageType
} from '@/app/_data-models/ImageFile_Dexie'
import { useInput } from '@/app/_providers/PromptInputProvider'
import { SourceProcessing } from '@/app/_types/HordeTypes'
import Section from '../../Section'
import NumberInput from '../../NumberInput'
import ImageThumbnail from '../../ImageThumbnail'
import {
  addImageToDexie,
  deleteImageFileByImageIdTx,
  updateImageFileFieldByImageId
} from '@/app/_db/ImageFiles'

const imgConfig = {
  quality: 0.95,
  maxWidth: 3072,
  maxHeight: 3072
}

export default function UploadImage() {
  const { setInput, sourceImages, setSourceImages } = useInput()

  const addImage = useCallback(
    async (image: ImageFileInterface) => {
      setSourceImages([...sourceImages, image])
      await addImageToDexie(image)

      if (sourceImages.length === 0) {
        setInput({
          source_processing: SourceProcessing.Img2Img
        })
      } else if (sourceImages.length >= 1) {
        setInput({
          source_processing: SourceProcessing.Remix
        })
      }
    },
    [setInput, setSourceImages, sourceImages]
  )

  const updateImageStrength = useCallback(
    async (image_id: string, strength: number) => {
      const updatedSourceImages = sourceImages.map((image) => {
        if (image.image_id === image_id) {
          return { ...image, strength: strength }
        }
        return image
      })

      await updateImageFileFieldByImageId(image_id, 'strength', strength)
      setSourceImages(updatedSourceImages)
    },
    [setSourceImages, sourceImages]
  )

  const handleRemoveUploadedImageClick = useCallback(
    async (image_id: string) => {
      const updated = sourceImages.filter(
        (image) => image.image_id !== image_id
      )

      setSourceImages(updated)
      await deleteImageFileByImageIdTx(image_id)

      if (sourceImages.length === 0) {
        setInput({
          source_processing: SourceProcessing.Prompt
        })
      }
    },
    [setInput, setSourceImages, sourceImages]
  )

  const handleUpload = useCallback(
    async ({ source_image }: { source_image: Blob }) => {
      const image: ImageFileInterface = {
        artbot_id: '__TEMP_USER_IMG_UPLOAD__',
        horde_id: '',
        image_id: nanoid(),
        imageType: ImageType.SOURCE,
        imageStatus: ImageStatus.OK,
        model: '',
        imageBlob: source_image,
        gen_metadata: [],
        seed: '',
        worker_id: '',
        worker_name: '',
        kudos: '0'
      }

      if (sourceImages.length >= 1) {
        image.strength = 1
      }

      await addImage(image)
    },
    [addImage, sourceImages]
  )

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const [acceptedFile] = acceptedFiles
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = async () => {
        const { readAndCompressImage } = await import('browser-image-resizer')
        const resizedImage = await readAndCompressImage(acceptedFile, imgConfig)

        let fullDataString

        if (resizedImage) {
          fullDataString = await getBase64(resizedImage)
        }

        if (!fullDataString) {
          return
        }

        const [, imgBase64String] = fullDataString.split(';base64,')

        try {
          const { croppedBase64 } = await cropToNearest64(imgBase64String)

          const imageBlob = await base64toBlob(croppedBase64)

          if (!imageBlob) {
            return
          }

          handleUpload({
            source_image: imageBlob as Blob
          })
        } catch (error) {
          console.error('Error cropping the image:', error)
        }
      }

      try {
        reader.readAsDataURL(acceptedFile)
      } catch (err) {
        console.error(`Upload image error: ${err}`)
      }
    },
    [handleUpload]
  )

  // const { input, setInput } = useInput()
  const { fileRejections, getRootProps, getInputProps, isDragActive } =
    useDropzone({ accept: { 'image/*': [] }, maxFiles: 1, onDrop })

  return (
    <>
      {sourceImages.length > 0 && (
        <Section title={`Uploaded images (${sourceImages.length} / 5)`}>
          {sourceImages.map((image, idx) => (
            <div key={`uploaded-image-${image.image_id}`}>
              {idx > 0 && (
                <div
                  className="border-dotted"
                  style={{ borderTop: '1px dotted white' }}
                ></div>
              )}
              <div className="relative col gap-1" key={image.image_id}>
                <div className="absolute top-1 right-1 w-[24px] h-[24px] opacity-45">
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-black z-0"></div>
                </div>
                <div
                  className="absolute top-1 right-1 cursor-pointer"
                  onClick={() => {
                    handleRemoveUploadedImageClick(image.image_id)
                  }}
                >
                  <div className="text-white opacity-100 z-10">
                    <IconX className="text-white" />
                  </div>
                </div>
                <ImageThumbnail
                  alt="uploaded image"
                  image_id={image.image_id}
                />
                {idx > 0 && (
                  <div>
                    <label className="options-label">
                      Stregth:
                      <div className="max-w-[140px]">
                        <NumberInput
                          min={0.05}
                          max={1}
                          onBlur={() => {
                            if (isNaN(image.strength as number)) {
                              updateImageStrength(image.image_id, 1)
                            } else {
                              updateImageStrength(
                                image.image_id,
                                parseFloat(Number(image.strength).toFixed(2))
                              )
                            }
                          }}
                          onChange={(num: string) => {
                            updateImageStrength(
                              image.image_id,
                              num as unknown as number
                            )
                          }}
                          onMinusClick={() => {
                            if (Number(image.strength) - 0.05 < 0.05) {
                              return
                            }
                            updateImageStrength(
                              image.image_id,
                              parseFloat(
                                (Number(image.strength) - 0.05).toFixed(2)
                              )
                            )
                          }}
                          onPlusClick={() => {
                            if (Number(image.strength) + 0.05 > 1) {
                              return
                            }
                            updateImageStrength(
                              image.image_id,
                              parseFloat(
                                (Number(image.strength) + 0.05).toFixed(2)
                              )
                            )
                          }}
                          value={image.strength as number}
                        />
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}
      <Section title="Upload image">
        {fileRejections?.length > 0 && (
          <div className="mb-2 text-red-500 text-lg font-bold">
            Please upload a single valid image file!
          </div>
        )}
        <div className={styles.Dropzone} {...getRootProps()}>
          <input {...getInputProps()} />
          <IconPhotoPlus style={{ display: 'block' }} />
          {isDragActive ? (
            `drop image here`
          ) : (
            <div>drag image or click to upload</div>
          )}
        </div>
      </Section>
    </>
  )
}
