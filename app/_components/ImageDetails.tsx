import {
  HordeApiParams,
  ImageParamsForHordeApi
} from '@/app/_data-models/ImageParamsForHordeApi'
import { IconCaretRight, IconCopy } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import PromptInput from '../_data-models/PromptInput'
import LoraDetails from './AdvancedOptions/LoRAs/LoraDetails'
import NiceModal from '@ebay/nice-modal-react'
import { toastController } from '../_controllers/toastController'
import { JobDetails } from '../_hooks/useImageDetails'
import { ImageFileInterface } from '../_data-models/ImageFile_Dexie'
import { JobStatus } from '../_types/ArtbotTypes'

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
          {imageRequest?.loras?.length > 0 && (
            <div className="mt-4">
              <div>[ LoRAs ]</div>
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
          {imageRequest?.workflows?.length > 0 && (
            <div className="mt-4">
              <div className="mb-1">[ Workflows ]</div>
              {imageRequest.workflows.map((workflow, idx) => {
                return (
                  <div
                    key={`${workflow.type}_${idx}`}
                    style={{
                      borderLeft: '2px solid #aabad4',
                      marginLeft: '4px',
                      paddingLeft: '8px'
                    }}
                  >
                    <div className="row">
                      <strong>Type: {workflow.type}</strong>
                    </div>
                    <div className="row">
                      <strong>Text: {workflow.text}</strong>
                    </div>
                    <div className="row">
                      <strong>Position: {workflow.position}</strong>
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

          {imageFile?.gen_metadata && imageFile?.gen_metadata?.length > 0 && (
            <div className="mt-4">
              <div className="mb-1">[ Generation Metadata ]</div>
              {imageFile.gen_metadata.map((gen, idx) => {
                return (
                  <div
                    key={`${gen}_${imageFile.image_id}_${idx}`}
                    style={{
                      borderLeft: '2px solid #aabad4',
                      marginLeft: '4px',
                      paddingLeft: '8px'
                    }}
                  >
                    <div className="row">
                      <strong>Type: {gen.type}</strong>
                    </div>
                    <div className="row">
                      <strong>Ref: {gen.ref}</strong>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="col gap-1">
            {imageFile.worker_name && (
              <div className="mt-4">
                <strong>Worker name: </strong>
                <div>{imageFile.worker_name}</div>
              </div>
            )}
            {imageFile.worker_id && (
              <div>
                <strong>Worker ID: </strong>
                <div>{imageFile.worker_id}</div>
              </div>
            )}
            {jobDetails.horde_id && (
              <div>
                <strong>Horde Job ID: </strong>
                <div>{jobDetails.horde_id}</div>
              </div>
            )}
          </div>
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
      <div className="col gap-1">
        <div className="row gap-1 w-full">
          <div className="w-[28px]">
            {display === 'info' && <IconCaretRight />}
          </div>
          <button
            className="cursor-pointer row text-[14px]"
            tabIndex={0}
            onClick={() => setDisplay('info')}
          >
            Image details
          </button>
        </div>

        <div className="row gap-1 w-full">
          <div className="w-[28px]">
            {display === 'request' && <IconCaretRight />}
          </div>
          <button
            className="cursor-pointer row text-[14px]"
            tabIndex={0}
            onClick={() => setDisplay('request')}
          >
            Request parameters
          </button>
        </div>
        {jobDetails.status === JobStatus.Done && (
          <div className="row gap-1 w-full">
            <div className="w-[28px]">
              {display === 'response' && <IconCaretRight />}
            </div>
            <button
              className="cursor-pointer row text-[14px]"
              tabIndex={0}
              onClick={() => setDisplay('response')}
            >
              API response
            </button>
          </div>
        )}
      </div>
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
