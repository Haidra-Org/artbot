'use client'

import Button from '@/app/_components/Button'
import Input from '@/app/_components/Input'
import { AppSettings } from '@/app/_data-models/AppSettings'
import {
  IconArrowBarLeft,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export default function Apikey() {
  const [apikey, setApikey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    const key = AppSettings.get('apiKey')
    setApikey(key)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      AppSettings.set('apiKey', apikey.trim())
    }
  }

  return (
    <div className="row items-end">
      <Input
        label="API key"
        onChange={(e) => setApikey(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter your API key"
        type={!showKey ? 'password' : 'text'}
        value={apikey}
      />
      <div className="row gap-1">
        <Button
          disabled={!apikey}
          onClick={() => {
            setApikey('')
            AppSettings.set('apiKey', '')
          }}
          theme="danger"
          title="Reset API key"
        >
          <IconArrowBarLeft />
        </Button>
        <Button
          onClick={() => setShowKey(!showKey)}
          title={!showKey ? 'Show API key' : 'Hide API key'}
        >
          {showKey ? <IconEyeOff /> : <IconEye />}
        </Button>
        <Button
          onClick={() => AppSettings.set('apiKey', apikey.trim())}
          title="Save API key"
        >
          <IconDeviceFloppy />
        </Button>
      </div>
    </div>
  )
}
