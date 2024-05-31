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
      AppSettings.set('apiKey', apikey)
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
          onClick={() => {
            setApikey('')
            AppSettings.set('apiKey', '')
          }}
          theme="danger"
        >
          <IconArrowBarLeft />
        </Button>
        <Button onClick={() => setShowKey(!showKey)}>
          {showKey ? <IconEyeOff /> : <IconEye />}
        </Button>
        <Button onClick={() => AppSettings.set('apiKey', apikey)}>
          <IconDeviceFloppy />
        </Button>
      </div>
    </div>
  )
}
