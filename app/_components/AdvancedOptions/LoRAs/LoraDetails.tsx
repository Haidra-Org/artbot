/* eslint-disable @next/next/no-img-element */
import { sanitize } from 'isomorphic-dompurify'
import PageTitle from '../../PageTitle'
import Carousel from '../../Carousel'
import Button from '../../Button'
import {
  IconBox,
  IconDeviceFloppy,
  IconHeart,
  IconHeartFilled
} from '@tabler/icons-react'
import NiceModal from '@ebay/nice-modal-react'
import { useCallback, useEffect, useState } from 'react'
import Section from '../../Section'
import OptionLabel from '../OptionLabel'
import Select from '../../Select'
import {
  getFavoriteImageEnhancementModule,
  toggleImageEnhancementFavorite,
  updateRecentlyUsedImageEnhancement
} from '@/app/_db/imageEnhancementModules'
import { useWindowSize } from '@/app/_hooks/useWindowSize'
import { AppSettings } from '@/app/_data-models/AppSettings'
import { Embedding, ModelVersion, SavedLora } from '@/app/_data-models/Civitai'

export default function LoraDetails({
  details,
  onUseLoraClick = () => {}
}: {
  details: Embedding
  onUseLoraClick?: (savedLora: SavedLora) => void
}) {
  const [baseFilters] = useState(AppSettings.get('civitAiBaseModelFilter'))
  const { height } = useWindowSize()
  const { modelVersions = [] } = details
  const [initModel = {} as ModelVersion] = modelVersions
  const [modelVersion, setModelVersion] = useState<ModelVersion>(initModel)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!modelVersion.id) return

    async function getIsFavorite() {
      const savedLoras = await getFavoriteImageEnhancementModule(
        modelVersion.id as string,
        'lora'
      )

      if (savedLoras && savedLoras.length > 0) {
        setIsFavorite(true)
      }
    }

    getIsFavorite()
  }, [modelVersion.id])

  const handleFavoriteClick = async () => {
    await toggleImageEnhancementFavorite({
      model: {
        ...details,
        modelVersions: [modelVersion]
      },
      type: 'lora',
      versionId: modelVersion.id as string
    })
  }

  const handleUseLoraClick = useCallback(() => {
    const savedLora = new SavedLora({
      ...details,
      versionId: modelVersion.id,
      modelVersions: [modelVersion],
      strength: 1,
      clip: 1
    })

    updateRecentlyUsedImageEnhancement({
      model: {
        ...details,
        modelVersions: [modelVersion]
      },
      modifier: 'lora',
      versionId: modelVersion.id as string
    })
    onUseLoraClick(savedLora)
    return savedLora
  }, [details, modelVersion, onUseLoraClick])

  const versionOptions = modelVersions.map((version) => {
    return {
      label: (
        <div>
          <span className="font-mono text-xs font-bold bg-slate-600 mr-2 p-1 rounded-md">
            {version.baseModel}
          </span>
          {version.name}
        </div>
      ),
      value: version
    }
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      const element = document.getElementById('LoraDetails')
      if (element) {
        element.scrollIntoView({
          behavior: 'auto',
          block: 'start',
          inline: 'start'
        })
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div>
      <div className="col w-full">
        <h2 className="row font-bold">
          LoRA Details{' '}
          <span className="text-xs font-normal">(via CivitAI)</span>
        </h2>
        <PageTitle>{details.name}</PageTitle>
        <div className="row w-full gap-4">
          <Button
            outline
            onClick={async () => {
              await handleFavoriteClick()
              setIsFavorite(!isFavorite)
            }}
          >
            {isFavorite ? <IconHeartFilled color={'red'} /> : <IconHeart />}
          </Button>
          <div className="row gap-2 rounded-md bg-slate-500 p-1 pr-2">
            <IconBox stroke={1.5} />
            {modelVersion.baseModel}
          </div>
          <div className="font-mono">Version: {modelVersion.name}</div>
        </div>
        <div className="col md:row gap-4 !items-start justify-start">
          <div className="w-full md:max-w-[512px]">
            <Carousel
              controls="top"
              numSlides={modelVersion.images.length}
              options={{ loop: true, containScroll: 'trimSnaps' }}
            >
              {modelVersion.images.map((image, idx) => {
                return (
                  <div
                    key={`image-${idx}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flex: '0 0 auto',
                      position: 'relative',
                      minWidth: 0,
                      width: '100%'
                    }}
                  >
                    <img
                      src={image.url}
                      alt=""
                      style={{
                        maxWidth: 'calc(100% - 16px)',
                        objectFit: 'contain',
                        width: 'auto',
                        height: 'auto',
                        maxHeight: height ? `${height - 256}px` : 'unset',
                        filter:
                          !baseFilters.includes('NSFW') && image.nsfwLevel > 6
                            ? 'blur(12px)'
                            : 'none'
                      }}
                    />
                  </div>
                )
              })}
            </Carousel>
          </div>
          <div className="col w-full max-w-[768px]">
            <Section>
              <OptionLabel
                title={
                  <span className="row font-bold text-sm text-white gap-1">
                    Select version
                  </span>
                }
              >
                <div className="w-full row">
                  <Select
                    onChange={(option) => {
                      // @ts-expect-error Need to properly type this
                      setModelVersion(option.value)
                    }}
                    // @ts-expect-error Need to properly type this
                    options={versionOptions}
                    value={{
                      // @ts-expect-error Need to properly type this
                      value: modelVersion,
                      label: modelVersion.name
                    }}
                  />
                  <Button
                    onClick={() => {
                      handleUseLoraClick()
                      NiceModal.remove('modal')
                      NiceModal.remove('embeddingDetails')
                    }}
                  >
                    <IconDeviceFloppy />
                  </Button>
                </div>
              </OptionLabel>
              {modelVersion?.description && (
                <div className="w-full col">
                  <span className="row font-bold text-sm text-white gap-1">
                    Version details:
                  </span>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sanitize(modelVersion?.description?.trim())
                    }}
                    style={{
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: '14px',
                      fontWeight: 400,
                      gap: '8px',
                      maxWidth: '768px',
                      padding: '8px'
                    }}
                  />
                </div>
              )}
            </Section>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(details.description)
              }}
              style={{
                borderRadius: '4px',
                display: 'flex',
                flexDirection: 'column',
                fontSize: '14px',
                fontWeight: 400,
                gap: '8px',
                maxWidth: '768px',
                padding: '8px'
              }}
            />
          </div>
        </div>

        <div className="w-full row justify-end">
          <Button
            outline
            onClick={() => {
              NiceModal.remove('embeddingDetails')
            }}
          >
            <div className="row">Cancel</div>
          </Button>
          <Button
            onClick={() => {
              handleUseLoraClick()
              NiceModal.remove('modal')
              NiceModal.remove('embeddingDetails')
            }}
          >
            <div className="row">
              <IconDeviceFloppy /> Use LoRA
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
