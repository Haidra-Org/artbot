import {
  HordeApiParams,
  ImageParamsForHordeApi
} from '@/app/_data-models/ImageParamsForHordeApi'
import { IconCodeDots, IconCopy } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import useImageDetails, { JobDetails } from '../_hooks/useImageDetails'
import PromptInput from '../_data-models/PromptInput'
// import { Store } from 'react-notifications-component'

export default function ImageDetails({ image_id }: { image_id: string }) {
  const [imageDetails] = useImageDetails(image_id)
  const [showRequestParams, setShowRequestParams] = useState(false)
  const [rawParams, setRawParams] = useState<{
    apiParams: HordeApiParams
    imageDetails: PromptInput
  }>()

  const { jobDetails, imageFile, imageRequest } =
    imageDetails || ({} as JobDetails)

  useEffect(() => {
    async function fetchParams() {
      if (!imageFile) return

      const raw = await ImageParamsForHordeApi.build({
        ...imageRequest,
        seed: imageFile.seed as string
      } as PromptInput)

      setRawParams(raw)
    }

    fetchParams()
  }, [imageFile, imageRequest])

  if (!imageDetails) return null

  const handleCopy = async () => {
    const prettyJson = JSON.stringify(rawParams?.apiParams, null, 2)

    if (!navigator.clipboard) {
      // Store.addNotification({
      //   title: 'Error',
      //   message: 'Unable to copy params to clipboard. JSON output to console.',
      //   type: 'warning',
      //   insert: 'top',
      //   container: 'top-right',
      //   dismiss: {
      //     duration: 5000,
      //     showIcon: true,
      //     onScreen: true
      //   }
      // })

      return
    }

    try {
      await navigator.clipboard.writeText(prettyJson)
      // Store.addNotification({
      //   title: 'Success!',
      //   message: 'Image request parameters copied to clipboard',
      //   type: 'success',
      //   insert: 'top',
      //   container: 'top-right',
      //   dismiss: {
      //     duration: 2500,
      //     showIcon: true,
      //     onScreen: true
      //   }
      // })
    } catch (err) {
      console.log(`Err. Unable to copy text to clipboard`, err)
    }
  }

  return (
    <div className="col">
      {!showRequestParams && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <div>
            <strong>Created: </strong>
            {new Date(jobDetails.created_timestamp).toLocaleString()}
          </div>
          <div className="mb-4" />
          <div>
            <strong>Model: </strong>
            {imageFile.model}
          </div>
          <div>
            <strong>Model version: </strong>
            ??
          </div>
          <div>
            <strong>Sampler: </strong>
            {imageRequest?.sampler}
          </div>
          <div>
            <strong>Kudos: </strong>
            {imageFile.kudos}
          </div>
          <div className="mb-4" />
          <div>
            <strong>Steps: </strong>
            {imageRequest.steps}
          </div>
          <div>
            <strong>Guidance (CFG scale): </strong>
            {imageRequest.cfg_scale}
          </div>
          <div>
            <strong>Seed: </strong>
            {imageFile.seed}
          </div>
          <div className="mb-4" />
          <div>
            <strong>Height: </strong>
            {imageRequest.height}px
          </div>
          <div>
            <strong>Width: </strong>
            {imageRequest.width}px
          </div>
          <div className="mb-4" />
          <div>
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
          <div className="mb-4" />
          <div>
            <strong>Worker ID: </strong>
            {imageFile.worker_id}
          </div>
          <div>
            <strong>Worker name: </strong>
            {imageFile.worker_name}
          </div>
          <div className="mb-4" />
          <div>
            <strong>Horde Job ID: </strong>
            {jobDetails.horde_id}
          </div>
        </div>
      )}
      {showRequestParams && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(rawParams?.apiParams, null, 2)}
          </pre>
        </div>
      )}
      <button
        className="cursor-pointer row text-[14px]"
        tabIndex={0}
        onClick={() => setShowRequestParams(!showRequestParams)}
      >
        <IconCodeDots stroke={1.5} />
        {showRequestParams ? 'Hide' : 'Show'} request parameters
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
