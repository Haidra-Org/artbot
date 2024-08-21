'use client'

import Button from '@/app/_components/Button'
import Input from '@/app/_components/Input'
import { AppSettings } from '@/app/_data-models/AppSettings'
import {
  IconCopy,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconTrash,
  IconX
} from '@tabler/icons-react'
import useHordeApiKey from '@/app/_hooks/useHordeApiKey'
import { useCallback, useEffect, useState } from 'react'
import { toastController } from '@/app/_controllers/toastController'
import { AppConstants } from '@/app/_data-models/AppConstants'
import Section from '@/app/_components/Section'
import {
  UserStore,
  updateUseSharedKey,
  updateUser
} from '@/app/_stores/UserStore'
import { sleep } from '@/app/_utils/sleep'
import { useStore } from 'statery'
import { HordeUser } from '@/app/_types/HordeTypes'
import DeleteConfirmation from '@/app/_components/Modal_DeleteConfirmation'
import NiceModal from '@ebay/nice-modal-react'

export default function Apikey() {
  const [handleLogin] = useHordeApiKey()
  const [apikey, setApikey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const { sharedKey } = useStore(UserStore)

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
    const key = AppSettings.apikey()

    if (key === AppConstants.AI_HORDE_ANON_KEY) return
    setApikey(key)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleApiKeySave()
    }
  }

  return (
    <div className="col gap-2">
      {sharedKey && (
        <Section title="Shared API Key">
          <div className="col gap-2">
            You are currently the following shared API key. All requests will be
            prioritized using this API key:
            <div className="font-mono font-bold">{sharedKey}</div>
            <Button
              theme="danger"
              onClick={async () => {
                AppSettings.set('sharedKey', '')
                updateUseSharedKey('')

                const apikey = AppSettings.apikey()

                if (apikey) {
                  await sleep(50)
                  window.location.reload()
                }
              }}
              style={{
                maxWidth: '200px'
              }}
            >
              <IconX /> Remove key?
            </Button>
          </div>
        </Section>
      )}
      {!sharedKey && (
        <Section anchor="api-key" title="AI Horde API key (optional)">
          <div>
            Leave blank for anonymous access. An API key gives higher priority
            access to the AI Horde distributed cluster, resulting in quicker
            image creation times.
          </div>
          <div className="col md:row w-full items-end h-auto">
            <Input
              onChange={(e) => setApikey(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your API key"
              type={!showKey ? 'password' : 'text'}
              value={apikey}
            />
            <div className="row w-auto justify-end gap-1 items-end min-h-[42px]">
              <Button
                disabled={!apikey.trim()}
                onClick={() => setShowKey(!showKey)}
                title={!showKey ? 'Show API key' : 'Hide API key'}
              >
                {showKey ? <IconEyeOff /> : <IconEye />}
              </Button>
              <Button
                disabled={!apikey.trim()}
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
              <div className="row items-center"></div>
              <Button
                disabled={!apikey.trim()}
                onClick={handleApiKeySave}
                title="Save API key"
              >
                <IconDeviceFloppy />
              </Button>
              <Button
                disabled={!apikey}
                onClick={() => {
                  NiceModal.show('delete', {
                    children: (
                      <DeleteConfirmation
                        deleteButtonTitle="Delete"
                        title="Remove API key?"
                        message={
                          <>
                            <p>
                              Are you sure you want to remove your Horde API
                              key? Make sure you have saved it somewhere safe!
                            </p>
                            <p>This cannot be undone.</p>
                          </>
                        }
                        onDelete={async () => {
                          setApikey('')
                          AppSettings.set('apiKey', '')
                          updateUser({} as HordeUser)
                          toastController({
                            message: 'API key removed from ArtBot!'
                          })
                        }}
                      />
                    )
                  })
                }}
                theme="danger"
                title="Remove / reset API key"
              >
                <IconTrash />
              </Button>
            </div>
          </div>
        </Section>
      )}
    </div>
  )
}
