'use client'
import PageTitle from '@/app/_components/PageTitle'
import JsonInput from './_component/JsonInput'
import { useState, useCallback } from 'react'
import Button from '@/app/_components/Button'
import generateImage from '@/app/_api/horde/generate'
import {
  HordeApiParams,
  ImageParamsForHordeApi
} from '@/app/_data-models/ImageParamsForHordeApi'
import { addPendingJobToDexie } from '@/app/_db/jobTransactions'
import { addPendingImageToAppState } from '@/app/_stores/PendingImagesStore'
import { JobStatus } from '@/app/_types/ArtbotTypes'
import { toastController } from '@/app/_controllers/toastController'

const defaultJson: HordeApiParams = {
  prompt: '',
  params: {
    cfg_scale: 2,
    seed: '',
    sampler_name: 'k_dpmpp_sde',
    height: 1024,
    width: 1024,
    post_processing: [],
    steps: 8,
    tiling: false,
    karras: true,
    hires_fix: false,
    clip_skip: 1,
    n: 1,
    loras: [
      {
        name: '247778',
        model: 1,
        clip: 1,
        is_version: true
      }
    ]
  },
  nsfw: false,
  censor_nsfw: true,
  trusted_workers: true,
  models: ['AlbedoBase XL (SDXL)'],
  r2: true,
  replacement_filter: true,
  worker_blacklist: false,
  shared: false,
  slow_workers: true
}

const prettyJson = JSON.stringify(defaultJson, null, 2)

export default function JsonPage() {
  const [jsonInput, setJsonInput] = useState<string>(prettyJson)
  const [isValid, setIsValid] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const handleJsonChange = useCallback((json: string) => {
    setJsonInput(json)
  }, [])

  const handleValidate = useCallback(
    (valid: boolean, errorMessage: string | null) => {
      setIsValid(valid)
      setError(errorMessage)
    },
    []
  )

  const handleReset = useCallback(() => {
    setJsonInput(prettyJson)
    setIsValid(true)
    setError(null)
  }, [])

  const requestImage = async (imageParams: HordeApiParams) => {
    try {
      const apiResponse = await generateImage(imageParams)
      if ('id' in apiResponse) {
        console.log(`apiResponse`, apiResponse)
        const input = ImageParamsForHordeApi.fromApiParams(imageParams)
        console.log(`input`, input)

        const pendingJob = await addPendingJobToDexie(
          { ...input },
          {
            horde_id: apiResponse.id,
            status: JobStatus.Queued
          }
        )
        addPendingImageToAppState(pendingJob)
        toastController({
          message: 'Image successfully requested!',
          type: 'success'
        })
      } else if ('errors' in apiResponse) {
        const prettyJson = JSON.stringify(apiResponse.errors, null, 2)
        toastController({
          message: `Error: ${apiResponse.message}\n\n${prettyJson}`,
          type: 'error'
        })
      }
    } catch (err) {
      console.log(`Err submitting request?`, err)
    }
  }

  const handleBlur = useCallback((json: string): string => {
    return json
  }, [])

  const handleSubmit = useCallback(() => {
    try {
      const parsedJson = JSON.parse(handleBlur(jsonInput))
      requestImage(parsedJson)

      // Do something with the validated JSON
      console.log('Saving JSON:', parsedJson)
    } catch (error) {
      console.error('Invalid JSON:', error)
      setIsValid(false)
      setError(error instanceof Error ? error.message : 'Invalid JSON')
    }
  }, [jsonInput, handleBlur])

  return (
    <div className="col">
      <PageTitle>Edit JSON</PageTitle>
      <div className="col">
        <JsonInput
          value={jsonInput}
          onChange={handleJsonChange}
          onValidate={handleValidate}
          error={error}
          onBlur={handleBlur}
        />
        <div className="row w-full justify-end">
          <Button theme="danger" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
