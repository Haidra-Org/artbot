import Input from '@/app/_components/Input'
import Button from '@/app/_components/Button'
import { useEffect, useState } from 'react'
import { SharedApiKey } from '@/app/_types/HordeTypes'

export default function AddEditSharedKey({
  buttonText = 'Create',
  onCreateClick = () => {},
  sharedKey
}: {
  buttonText?: 'Create' | 'Update'
  // @ts-expect-error TODO: Handle types
  onCreateClick?: ({ id, name, kudos }) => void
  sharedKey?: SharedApiKey
}) {
  const [pending, setPending] = useState(false)
  const [inputKeyId, setInputKeyId] = useState('')
  const [inputKeyName, setInputKeyName] = useState('')
  const [inputKeyKudos, setInputKeyKudos] = useState('')

  useEffect(() => {
    if (sharedKey) {
      setInputKeyId(sharedKey.id)
      setInputKeyName(sharedKey.name)
      setInputKeyKudos(sharedKey.kudos.toString())
    }
  }, [sharedKey])

  return (
    <div className="flex flex-col gap-4 px-2">
      <h2 className="font-bold">Create shared API key</h2>
      <div>
        <label htmlFor="inputKeyName">Shared key name:</label>
        <Input
          type="text"
          value={inputKeyName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setInputKeyName(event.target.value)
          }
        />
      </div>
      <div>
        <label htmlFor="inputKeyKudos">Total kudos:</label>
        <Input
          type="number"
          value={inputKeyKudos}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setInputKeyKudos(event.target.value)
          }
        />
      </div>
      <div className="flex flex-row gap-2 w-full justify-end">
        {/* <Button onClick={() => setShowCreateModal(false)} theme="secondary">
          Cancel
        </Button> */}
        <Button
          disabled={pending}
          onClick={async () => {
            setPending(true)

            onCreateClick({
              id: inputKeyId,
              name: inputKeyName,
              kudos: inputKeyKudos
            })
          }}
        >
          {pending ? 'Requesting...' : buttonText}
        </Button>
      </div>
    </div>
  )
}
