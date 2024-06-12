'use client'

/**
 * This component is used to initialize various
 * functions when the web app first loads.
 */

import useHordeApiKey from './_hooks/useHordeApiKey'
import { AppSettings } from './_data-models/AppSettings'
import { useEffectOnce } from './_hooks/useEffectOnce'
import { initDexie } from './_db/dexie'
import {
  initJobController,
  loadPendingImagesFromDexie
} from './_controllers/pendingJobController'

export default function AppInit() {
  const [handleLogin] = useHordeApiKey()

  const getUserInfoOnLoad = async () => {
    const apikey = AppSettings.get('apiKey')

    if (!apikey || !apikey.trim() || apikey === '0000000000') return

    await handleLogin(apikey)
  }

  useEffectOnce(() => {
    console.log(`ArtBot v2.0.0_beta is online: ${new Date().toLocaleString()}`)
    initDexie()
    getUserInfoOnLoad()
    loadPendingImagesFromDexie()
    initJobController()
  })

  return null
}
