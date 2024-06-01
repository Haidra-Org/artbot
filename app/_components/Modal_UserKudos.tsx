import { IconCoins, IconStack } from '@tabler/icons-react'
import { useStore } from 'statery'
import { UserStore } from '../_stores/UserStore'

export default function UserKudosModal() {
  const { userDetails } = useStore(UserStore)
  const { kudos, records } = userDetails

  return (
    <div className="flex flex-col gap-2">
      <div className="stats bg-body-color">
        <div className="stat">
          <div className="font-bold pb-1">Total Available Kudos</div>
          <div className="row">
            <div className="text-secondary">
              <IconCoins />
            </div>
            {kudos.toLocaleString()}
          </div>
        </div>
      </div>
      {records.request && (
        <div className="stats bg-body-color">
          <div className="stat">
            <div className="font-bold p-1">Images requested</div>
            <div className="row">
              <div className=" text-secondary">
                <IconStack />
              </div>
              {records.request.image.toLocaleString()}
            </div>
          </div>
        </div>
      )}
      <div className="text-xs italic">
        Due to server caching, data may be a few minutes out of date.
      </div>
    </div>
  )
}
