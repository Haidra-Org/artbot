'use client'

import Button from '@/app/_components/Button'
import Input from '@/app/_components/Input'
import { AppSettings } from '@/app/_data-models/AppSettings'
import {
  IconCopy,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconTrash
} from '@tabler/icons-react'
import useHordeApiKey from '@/app/_hooks/useHordeApiKey'
import { useCallback, useEffect, useState } from 'react'
import { toastController } from '@/app/_controllers/toastController'

export default function Apikey() {
  const [handleLogin] = useHordeApiKey()
  const [apikey, setApikey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const handleApiKeySave = useCallback(async () => {
    AppSettings.set('apiKey', apikey.trim())

    if (!apikey.trim()) return

    const result = await handleLogin(apikey.trim())

    if (result.success) {
      toastController({
        message: 'Successfully logged into AI Horde!'
      })
    } else {
      toastController({
        message: 'Unable to login. Check API key.',
        type: 'error'
      })
    }
  }, [apikey, handleLogin])

  useEffect(() => {
    const key = AppSettings.get('apiKey')

    if (key === '0000000000') return
    setApikey(key)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApiKeySave()
    }
  }

  return (
    <div className="col md:row w-full items-end h-auto sm:h-[70px]">
      <Input
        label="API key"
        onChange={(e) => setApikey(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your API key"
        type={!showKey ? 'password' : 'text'}
        value={apikey}
      />
      <div className="row !h-full w-auto justify-end gap-1 items-end">
        <Button
          disabled={!apikey}
          onClick={() => {
            setApikey('')
            AppSettings.set('apiKey', '')
            toastController({
              message: 'API key removed from ArtBot!'
            })
          }}
          theme="danger"
          title="Remove / reset API key"
        >
          <IconTrash />
        </Button>
        <Button
          onClick={() => setShowKey(!showKey)}
          title={!showKey ? 'Show API key' : 'Hide API key'}
        >
          {showKey ? <IconEyeOff /> : <IconEye />}
        </Button>
        <Button
          onClick={() => {
            if (apikey) {
              navigator.clipboard.writeText(apikey)
              toastController({
                message: 'API key copied to clipboard!'
              })
            }
          }}
          title="Copy API key"
        >
          <IconCopy />
        </Button>
        <Button
          disabled={!apikey.trim()}
          onClick={handleApiKeySave}
          title="Save API key"
        >
          <IconDeviceFloppy />
        </Button>
      </div>
    </div>
  )
}
