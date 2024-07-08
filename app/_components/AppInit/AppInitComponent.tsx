'use client'

/**
 * This component is used to initialize various
 * functions when the web app first loads.
 */

import useHordeApiKey from '../../_hooks/useHordeApiKey'
import { AppSettings } from '../../_data-models/AppSettings'
import { useEffectOnce } from '../../_hooks/useEffectOnce'
import { initDexie } from '../../_db/dexie'
import {
  initJobController,
  loadPendingImagesFromDexie
} from '../../_controllers/pendingJobController'
import { AvailableImageModel, ImageModelDetails } from '@/app/_types/HordeTypes'
import { useEffect } from 'react'
import { setAvailableModels, setImageModels } from '@/app/_stores/ModelStore'
import { AppConstants } from '@/app/_data-models/AppConstants'

export default function AppInitComponent({
  modelsAvailable,
  modelDetails
}: {
  modelsAvailable: AvailableImageModel[]
  modelDetails: { [key: string]: ImageModelDetails }
}) {
  const [handleLogin] = useHordeApiKey()

  const getUserInfoOnLoad = async () => {
    const apikey = AppSettings.get('apiKey')

    if (!apikey || !apikey.trim() || apikey === AppConstants.AI_HORDE_ANON_KEY)
      return

    await handleLogin(apikey)
  }

  useEffect(() => {
    setAvailableModels(modelsAvailable)
    setImageModels(modelDetails)
  }, [modelDetails, modelsAvailable])

  useEffectOnce(() => {
    console.log(`ArtBot v2.0.0_beta is online: ${new Date().toLocaleString()}`)
    initDexie()
    getUserInfoOnLoad()
    loadPendingImagesFromDexie()
    initJobController()
  })

  return null
}
