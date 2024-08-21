'use client'

/**
 * This component is used to initialize various
 * functions when the web app first loads.
 */

import useHordeApiKey from '../../_hooks/useHordeApiKey'
import { AppSettings } from '../../_data-models/AppSettings'
import { useEffectOnce } from '../../_hooks/useEffectOnce'
import { initDexie } from '../../_db/dexie'
import { AvailableImageModel, ImageModelDetails } from '@/app/_types/HordeTypes'
import { useEffect } from 'react'
import { setAvailableModels, setImageModels } from '@/app/_stores/ModelStore'
import { AppConstants } from '@/app/_data-models/AppConstants'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AppStore,
  setAppBuildId,
  setAppOnlineStatus
} from '@/app/_stores/AppStore'
import { appBasepath } from '@/app/_utils/browserUtils'
import { loadPendingImagesFromDexie } from '@/app/_controllers/pendingJobs/loadPendingImages'
import { initJobController } from '@/app/_controllers/pendingJobs'
import { toastController } from '@/app/_controllers/toastController'
import { updateUseSharedKey } from '@/app/_stores/UserStore'

export default function AppInitComponent({
  modelsAvailable,
  modelDetails
}: {
  modelsAvailable: AvailableImageModel[]
  modelDetails: { [key: string]: ImageModelDetails }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sharedKey = searchParams?.get('api_key')

  const [handleLogin] = useHordeApiKey()

  const initHeartbeat = async () => {
    try {
      const res = await fetch(`${appBasepath()}/api/heartbeat`)
      const { success, buildId } = (await res.json()) || {}
      if (success) {
        setAppOnlineStatus(true)
      } else {
        setAppOnlineStatus(false)
      }

      if (buildId && !AppStore.state.buildId) {
        setAppBuildId(buildId)
      } else if (buildId && AppStore.state.buildId !== buildId) {
        toastController({
          type: 'error',
          message: 'ArtBot has been updated. Please refresh the page.',
          timeout: 86400000,
          id: 'artbot_updated'
        })
      }
    } catch (err) {
      setAppOnlineStatus(false)
    }
  }

  const getUserInfoOnLoad = async () => {
    const apikey = AppSettings.apikey()

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
    const intervalHeartbeat = setInterval(initHeartbeat, 15 * 1000)

    return () => {
      clearInterval(intervalHeartbeat)
    }
  })

  useEffect(() => {
    if (sharedKey) {
      updateUseSharedKey(sharedKey)
      AppSettings.set('sharedKey', sharedKey)
    } else if (AppSettings.get('sharedKey')) {
      updateUseSharedKey(AppSettings.get('sharedKey'))
    }
  }, [sharedKey])

  useEffect(() => {
    router.prefetch('/create')
    router.prefetch('/images')
    router.prefetch('/settings')
  }, [router])
  return null
}
