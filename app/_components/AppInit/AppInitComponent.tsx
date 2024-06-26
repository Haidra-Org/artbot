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
import { ImageModelDetails } from '@/app/_types/HordeTypes'
import { useEffect } from 'react'
import { setImageModels } from '@/app/_stores/ModelStore'

export default function AppInitComponent({
  modelDetails
}: {
  modelDetails: { [key: string]: ImageModelDetails }
}) {
  const [handleLogin] = useHordeApiKey()

  const getUserInfoOnLoad = async () => {
    const apikey = AppSettings.get('apiKey')

    if (!apikey || !apikey.trim() || apikey === '0000000000') return

    await handleLogin(apikey)
  }

  useEffect(() => {
    setImageModels(modelDetails)
  }, [modelDetails])

  useEffectOnce(() => {
    console.log(`ArtBot v2.0.0_beta is online: ${new Date().toLocaleString()}`)
    initDexie()
    getUserInfoOnLoad()
    loadPendingImagesFromDexie()
    initJobController()
  })

  return null
}
