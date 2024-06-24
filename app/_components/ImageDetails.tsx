import {
  HordeApiParams,
  ImageParamsForHordeApi
} from '@/app/_data-models/ImageParamsForHordeApi'
import { IconCodeDots, IconCopy } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import PromptInput from '../_data-models/PromptInput'
import LoraDetails from './AdvancedOptions/LoRAs/LoraDetails'
import NiceModal from '@ebay/nice-modal-react'
import { toastController } from '../_controllers/toastController'
import { JobDetails } from '../_hooks/useImageDetails'
import { ImageFileInterface } from '../_data-models/ImageFile_Dexie'

export default function ImageDetails({
  imageDetails
}: {
  imageDetails: JobDetails
}) {
  const [display, setDisplay] = useState<'info' | 'request' | 'response'>(
    'info'
  )
  const [rawParams, setRawParams] = useState<{
    apiParams: HordeApiParams
    imageDetails: PromptInput
  }>()

  const {
    jobDetails,
    imageFile = {} as ImageFileInterface,
    imageRequest
  } = imageDetails || ({} as JobDetails)

  useEffect(() => {
    async function fetchParams() {
      if (!imageFile || !imageRequest) return

      const raw = await ImageParamsForHordeApi.build({
        ...imageRequest,
        seed: (imageFile.seed as string) || imageRequest.seed
      } as PromptInput)

      setRawParams(raw)
    }

    fetchParams()
  }, [imageFile, imageRequest])

  if (!imageDetails || !jobDetails) return null

  const handleCopy = async () => {
    const prettyJson = JSON.stringify(rawParams?.apiParams, null, 2)

    if (!navigator.clipboard) {
      toastController({
        message:
          'Unable to copy image parameterss to clipboard. JSON output to browser console.',
        type: 'error'
      })

      return
    }

    try {
      await navigator.clipboard.writeText(prettyJson)
      toastController({
        message: 'Image request parameters copied to clipboard',
        type: 'success'
      })
    } catch (err) {
      console.log(`Err. Unable to copy text to clipboard`, err)
    }
  }

  return (
    <div className="col">
      {display === 'info' && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <div>
            <strong>Created: </strong>
            {new Date(jobDetails.created_timestamp).toLocaleString()}
          </div>
          <div className="mt-4">
            <strong>Model: </strong>
            {imageFile.model || imageRequest.models[0]}
          </div>
          <div>
            <strong>Model version: </strong>
            {imageRequest?.modelDetails?.version ?? 'N/A'}
          </div>
          <div>
            <strong>Baseline: </strong>
            {imageRequest?.modelDetails?.baseline ?? 'N/A'}
          </div>
          <div>
            <strong>Sampler: </strong>
            {imageRequest?.sampler}
          </div>
          {imageFile.kudos && (
            <div>
              <strong>Kudos: </strong>
              {imageFile.kudos}
            </div>
          )}
          {imageRequest.preset.length > 0 && (
            <div className="mt-4">
              <strong>Preset: </strong>
              {imageRequest.preset[0].name}
            </div>
          )}
          <div className="mt-4">
            <strong>Steps: </strong>
            {imageRequest.steps}
          </div>
          <div>
            <strong>Guidance (CFG scale): </strong>
            {imageRequest.cfg_scale}
          </div>
          {(imageFile.seed || imageRequest.seed) && (
            <div>
              <strong>Seed: </strong>
              {imageFile.seed || imageRequest.seed}
            </div>
          )}
          <div className="mt-4">
            <div>
              <strong>Height: </strong>
              {imageRequest.height}px
            </div>
            <div>
              <strong>Width: </strong>
              {imageRequest.width}px
            </div>
          </div>
          {imageRequest.loras.length > 0 && (
            <div className="mt-4">
              {imageRequest.loras.map((lora) => {
                return (
                  <div
                    key={lora.name}
                    style={{
                      borderLeft: '2px solid #aabad4',
                      paddingLeft: '8px'
                    }}
                  >
                    <div
                      className="row"
                      onClick={() => {
                        if (lora.isArtbotManualEntry) return

                        NiceModal.show('embeddingDetails', {
                          children: <LoraDetails details={lora} />
                        })
                      }}
                    >
                      <strong>LoRA: </strong>
                      {!lora.isArtbotManualEntry ? (
                        <div className="cursor-pointer primary-color">
                          {lora.name}
                        </div>
                      ) : (
                        <div>{lora.name}</div>
                      )}
                    </div>
                    <div className="row">
                      <strong>
                        LoRA version:{' '}
                        {lora.modelVersions
                          ? lora?.modelVersions[0]?.name
                          : lora.name}
                      </strong>
                    </div>
                    <div className="row">
                      <strong>Strength: </strong>
                      {lora.strength}
                    </div>
                    <div className="row">
                      <strong>CLIP: </strong>
                      {lora.strength}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-4">
            <strong>Karras: </strong>
            {imageRequest.karras ? 'true' : 'false'}
          </div>
          <div>
            <strong>Hi-res fix: </strong>
            {imageRequest.hires ? 'true' : 'false'}
          </div>
          <div>
            <strong>CLIP skip: </strong>
            {imageRequest.clipskip}
          </div>
          <div>
            <strong>Tiled: </strong>
            {imageRequest.tiling ? 'true' : 'false'}
          </div>
          {imageFile.worker_id && (
            <div className="mt-4">
              <strong>Worker ID: </strong>
              {imageFile.worker_id}
            </div>
          )}
          {imageFile.worker_name && (
            <div>
              <strong>Worker name: </strong>
              {imageFile.worker_name}
            </div>
          )}
          {jobDetails.horde_id && (
            <div className="mt-4">
              <strong>Horde Job ID: </strong>
              {jobDetails.horde_id}
            </div>
          )}
        </div>
      )}
      {display === 'request' && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(rawParams?.apiParams, null, 2)}
          </pre>
        </div>
      )}
      {display === 'response' && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <pre
            className="whitespace-pre-wrap"
            style={{
              overflowWrap: 'break-word'
            }}
          >
            {JSON.stringify(JSON.parse(imageFile.apiResponse), null, 2)}
          </pre>
        </div>
      )}
      <button
        className="cursor-pointer row text-[14px]"
        tabIndex={0}
        onClick={() => setDisplay('info')}
      >
        <IconCodeDots stroke={1.5} />
        Image details
      </button>
      <button
        className="cursor-pointer row text-[14px]"
        tabIndex={0}
        onClick={() => setDisplay('request')}
      >
        <IconCodeDots stroke={1.5} />
        Request parameters
      </button>
      <button
        className="cursor-pointer row text-[14px]"
        tabIndex={0}
        onClick={() => setDisplay('response')}
      >
        <IconCodeDots stroke={1.5} />
        API response
      </button>
      <button
        className="cursor-pointer row text-[14px]"
        tabIndex={0}
        onClick={handleCopy}
      >
        <IconCopy stroke={1.5} />
        Copy JSON request parameters
      </button>
    </div>
  )
}
