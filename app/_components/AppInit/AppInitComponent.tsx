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
import { useRouter } from 'next/navigation'
import { setAppOnlineStatus } from '@/app/_stores/AppStore'

export default function AppInitComponent({
  modelsAvailable,
  modelDetails
}: {
  modelsAvailable: AvailableImageModel[]
  modelDetails: { [key: string]: ImageModelDetails }
}) {
  const router = useRouter()
  const [handleLogin] = useHordeApiKey()

  const initHeartbeat = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_PATH}/api/heartbeat`
      )
      const { success } = (await res.json()) || {}

      if (success) {
        setAppOnlineStatus(true)
      } else {
        setAppOnlineStatus(false)
      }
    } catch (err) {
      setAppOnlineStatus(false)
    }
  }

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

    initHeartbeat()
    const interval = setInterval(initHeartbeat, 15 * 1000)

    return () => {
      clearInterval(interval)
    }
  })

  useEffect(() => {
    router.prefetch('/create')
    router.prefetch('/images')
    router.prefetch('/settings')
  }, [router])
  return null
}
