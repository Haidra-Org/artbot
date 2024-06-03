'use client'

/**
 * This component is used to initialize various
 * functions when the web app first loads.
 */

import useHordeApiKey from './_hooks/useHordeApiKey'
import { AppSettings } from './_data-models/AppSettings'
import { useEffectOnce } from './_hooks/useEffectOnce'
import { initDexie } from './_db/dexie'

export default function AppInit() {
  const [handleLogin] = useHordeApiKey()

  const getUserInfoOnLoad = async () => {
    const apiKey = AppSettings.get('apiKey')

    if (apiKey === '0000000000') return

    await handleLogin(apiKey)
  }

  useEffectOnce(() => {
    console.log(`ArtBot v2.0.0_beta is online: ${new Date().toLocaleString()}`)
    initDexie()
    getUserInfoOnLoad()
  })

  return null
}
