import { clientHeader } from '../_data-models/ClientHeader'
import { AppSettings } from '../_data-models/AppSettings'
import { HordeUser } from '../_types/HordeTypes'
import { updateUser } from '../_stores/UserStore'

interface ErrorResponse {
  message: string
}

// type guard functions
function isErrorResponse(response: ErrorResponse): response is ErrorResponse {
  return (response as ErrorResponse).message !== undefined
}

function isUserResponse(response: HordeUser): response is HordeUser {
  return (response as HordeUser).username !== undefined
}

export default function useHordeApiKey() {
  // const { userDetails } = useStore(UserStore)

  const handleLogin = async (apikey: string = '') => {
    if (!apikey.trim()) {
      return { success: false }
    }

    try {
      const res = await fetch(`https://aihorde.net/api/v2/find_user`, {
        headers: {
          apikey: apikey,
          'Client-Agent': clientHeader(),
          'Content-Type': 'application/json'
        }
      })

      const data = (await res.json()) || {}

      if (isErrorResponse(data)) {
        return { success: false, message: data.message }
      } else if (isUserResponse(data)) {
        console.log(`Successfully logged in as ${data.username}`)
        AppSettings.set('apiKey', apikey)
        updateUser(data)
      } else {
        console.warn('useHordeApiKey: Unknown data structure received', data)
        return { success: false, message: 'Unknown data structure received' }
      }

      return data
    } catch (err) {
      console.warn(`useHordeApiKey: ${err}`)
      return { success: false, message: (err as Error).message }
    }
  }

  return [handleLogin]
}
