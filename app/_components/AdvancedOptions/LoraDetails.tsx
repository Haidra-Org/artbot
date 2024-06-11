import { sanitize } from 'isomorphic-dompurify'
import { Embedding, ModelVersion } from '@/app/_types/CivitaiTypes'
import PageTitle from '../PageTitle'
import Carousel from '../Carousel'
import Button from '../Button'
import { IconBox, IconDeviceFloppy, IconHeart } from '@tabler/icons-react'
import NiceModal from '@ebay/nice-modal-react'
import { useEffect, useState } from 'react'
import Section from '../Section'
import OptionLabel from './OptionLabel'
import Select from '../Select'

export default function LoraDetails({ details }: { details: Embedding }) {
  console.log(`details?`, details)
  const { modelVersions = [] } = details
  const [initModel = {} as ModelVersion] = modelVersions
  const [modelVersion, setModelVersion] = useState<ModelVersion>(initModel)

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
    <div id="LoraDetails">
      <div className="col w-full">
        <h2 className="row font-bold">
          LoRA Details{' '}
          <span className="text-xs font-normal">(via CivitAI)</span>
        </h2>
        <PageTitle>{details.name}</PageTitle>
        <div className="row w-full gap-4">
          <Button outline onClick={() => {}}>
            <IconHeart />
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
              controls={'top'}
              slides={modelVersion.images.map((image) => {
                return { src: image.url }
              })}
            />
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
                  <Button onClick={() => {}}>
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
          <Button onClick={() => {}}>
            <div className="row">
              <IconDeviceFloppy /> Use LoRA
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
