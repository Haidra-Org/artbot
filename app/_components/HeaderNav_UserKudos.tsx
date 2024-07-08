'use client'

import { IconCoins } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { ThreeDots } from 'react-loader-spinner'
import { useStore } from 'statery'

// import UserKudosModal from '@/app/_components/modals/UserKudosModal'
import { AppSettings } from '@/app/_data-models/AppSettings'
import { formatKudos } from '@/app/_utils/numberUtils'
import NiceModal from '@ebay/nice-modal-react'

import { UserStore } from '../_stores/UserStore'
import UserKudosModal from './Modal_UserKudos'
import { AppConstants } from '../_data-models/AppConstants'

export default function UserKudos() {
  const { userDetails } = useStore(UserStore)
  const { kudos } = userDetails

  // Prevent hydration warnings
  const [clientApiKey, setClientApiKey] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration warnings
  useEffect(() => {
    const apikey = AppSettings.get('apiKey')

    if (!apikey || !apikey.trim() || apikey === AppConstants.AI_HORDE_ANON_KEY)
      return
    setClientApiKey(apikey)
    setIsClient(true)
  }, [userDetails])

  if (
    !isClient ||
    (!clientApiKey && !userDetails) ||
    (!clientApiKey && !userDetails.username)
  ) {
    return null
  }

  return (
    <button
      className="row text-xs py-[4px] px-[6px] rounded-md bg-zinc-400 dark:bg-zinc-700"
      onClick={() => {
        NiceModal.show('modal', {
          children: <UserKudosModal />
        })
      }}
    >
      <IconCoins stroke={1} size={20} />
      {clientApiKey && !userDetails.username ? (
        <span>
          <ThreeDots
            visible={true}
            height="16"
            width="20"
            color="rgb(20, 184, 166)"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </span>
      ) : (
        <span>{formatKudos(kudos)}</span>
      )}
    </button>
  )
}
