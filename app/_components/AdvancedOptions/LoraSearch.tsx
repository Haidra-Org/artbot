/* eslint-disable @next/next/no-img-element */
import PhotoAlbum from 'react-photo-album'
import LORAS from './_LORAs.json'
import { Embedding } from '@/app/_types/CivitaiTypes'
import Button from '../Button'
import { IconArrowBarLeft, IconFilter } from '@tabler/icons-react'

// TODO: Delete LoRA import once search works.

export default function LoraSearch() {
  // @ts-expect-error TODO: Need to properly type this later
  const transformedData = LORAS.items.map((embedding: Embedding) => {
    // TODO: Should probably find image with lowest NSFW rating.
    // Extracting the first model version and its first image
    const firstModelVersion = embedding.modelVersions[0]
    const firstImage = firstModelVersion.images[0]

    const photoData = {
      key: String(embedding.id), // Ensuring the key is a string
      name: embedding.name,
      src: firstImage.url,
      width: firstImage.width,
      height: firstImage.height
    }

    return photoData
  })

  console.log(transformedData)

  return (
    <div className="col w-full">
      <h2 className="row font-bold">
        LoRA Search <span className="text-xs font-normal">(via CivitAI)</span>
      </h2>
      <div className="row w-full">
        <input
          className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search for LoRA or Lycoris"
          // onChange={(e) => setInput({ seed: e.target.value })}
          // onKeyDown={handleKeyDown}
          // value={input.seed}
        />
        <Button theme="danger" onClick={() => {}}>
          <IconArrowBarLeft />
        </Button>
        <Button onClick={() => {}}>
          <IconFilter />
        </Button>
      </div>
      <div>
        <PhotoAlbum
          layout="columns"
          spacing={8}
          photos={transformedData}
          renderPhoto={(renderPhotoProps) => {
            const { layoutOptions, photo, imageProps } = renderPhotoProps || {}
            const { alt, style, ...restImageProps } = imageProps || {}

            console.log(`renderPhotoProps`, renderPhotoProps)

            return (
              <div
                key={photo.key}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  marginBottom: layoutOptions.spacing
                }}
              >
                <img
                  alt={alt}
                  style={{
                    ...style,
                    width: '100%',
                    height: 'auto',
                    marginBottom: '0 !important'
                  }}
                  {...restImageProps}
                  src={imageProps.src}
                />
                <div
                  className="row items-center justify-center font-bold text-xs px-2"
                  style={{
                    backdropFilter: 'blur(10px)',
                    bottom: 0,
                    height: '64px',
                    left: 0,
                    position: 'absolute',
                    right: 0
                  }}
                >
                  <div>{photo.name}</div>
                </div>
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}
