'use client'

import { fetchHordeWorkers } from '@/app/_api/horde/workers'
import Button from '@/app/_components/Button'
import SelectCombo, { SelectOption } from '@/app/_components/ComboBox'
import Section from '@/app/_components/Section'
import Switch from '@/app/_components/Switch'
import { AppSettings } from '@/app/_data-models/AppSettings'
import { UserStore, updateWorkerUsagePreference } from '@/app/_stores/UserStore'
import { SelectedUserWorker } from '@/app/_types/ArtbotTypes'
import { HordeWorker } from '@/app/_types/HordeTypes'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useStore } from 'statery'

const MAX_ENTRIES = 5

const allowTip = `Add workers to send all image requests only to specific workers. Useful for debugging purposes or testing features available on particular workers. Maximum of 5 workers.`
const blockTip = `Add worker IDs here to prevent sending image requests to that machine. Useful in instances where a worker is out of date, serving incorrect models, or a troll. Adding workers here will increase kudos costs by 10% due to unoptimal use of Horde resources. Max of 5.`

export default function WorkerList({
  type = 'block'
}: {
  type?: 'allow' | 'block'
}) {
  const { forceAllowedWorkers, forceBlockedWorkers } = useStore(UserStore)
  const [selectedWorker, setSelectedWorker] = useState<string>('')
  const [userWorkersList, setUserWorkersList] = useState<SelectedUserWorker[]>(
    []
  )
  const [workers, setWorkers] = useState<HordeWorker[]>([])

  const handleAddWorker = (workerObj: SelectOption) => {
    const updatedWorkers = [...userWorkersList]
    const exists = updatedWorkers.filter((obj) => obj.value === workerObj.value)

    if (!exists || exists.length === 0) {
      updatedWorkers.push({
        label: workerObj.label as string,
        value: workerObj.value as string,
        timestamp: new Date().toLocaleString()
      })

      const appWorkersType =
        type === 'allow' ? 'allowedWorkers' : 'blockedWorkers'

      AppSettings.set(appWorkersType, updatedWorkers)
      setUserWorkersList(updatedWorkers)
    }
  }

  const removeWorkerFromList = (worker: SelectOption) => {
    const updatedWorkers = userWorkersList.filter(
      (obj) => obj.value !== worker.value
    )

    const appWorkersSetting =
      type === 'allow' ? 'useAllowedWorkers' : 'useBlockedWorkers'
    const appWorkersType =
      type === 'allow' ? 'allowedWorkers' : 'blockedWorkers'

    if (updatedWorkers.length === 0) {
      setUserWorkersList([])
      AppSettings.set(appWorkersSetting, false)
    }

    AppSettings.set(
      appWorkersType,
      updatedWorkers.length === 0 ? [] : updatedWorkers
    )
    setUserWorkersList(updatedWorkers)
  }

  useEffect(() => {
    async function fetchWorkers() {
      const result = await fetchHordeWorkers()
      setWorkers(result)
    }

    fetchWorkers()
  }, [])

  useEffect(() => {
    const appWorkersType =
      type === 'allow' ? 'allowedWorkers' : 'blockedWorkers'

    const list = AppSettings.get(appWorkersType) || []

    const allowed = AppSettings.get('useAllowedWorkers')
    const blocked = AppSettings.get('useBlockedWorkers')

    updateWorkerUsagePreference({
      forceAllowedWorkers: allowed,
      forceBlockedWorkers: blocked
    })

    setUserWorkersList(list)
  }, [type])

  const workerOptions = workers.map((worker) => {
    return {
      label: `${worker.name}`,
      filterLabel: `${worker.name} ${worker.id}`,
      component: (
        <div className="col gap-0 mb-0">
          <div>{worker.name}</div>
          <div className="text-xs font-mono">{worker.id}</div>
        </div>
      ),
      value: worker.id
    }
  })

  const sectionTitle = type === 'allow' ? 'Allowed Workers' : 'Blocked Workers'

  return (
    <Section
      anchor={type === 'allow' ? 'allowed-workers' : 'blocked-workers'}
      title={`${sectionTitle} (${userWorkersList.length} / ${MAX_ENTRIES})`}
    >
      <div className="col gap-2">
        <div>
          {type === 'allow' && allowTip}
          {type === 'block' && blockTip}
        </div>
        <div>
          <label className="row gap-2 text-white">
            <strong>Use {type}ed workers?</strong>
            <Switch
              disabled={userWorkersList.length === 0}
              checked={
                type === 'allow' ? forceAllowedWorkers : forceBlockedWorkers
              }
              onChange={() => {
                if (type === 'allow' && forceAllowedWorkers) {
                  AppSettings.set('useAllowedWorkers', false)

                  updateWorkerUsagePreference({
                    forceAllowedWorkers: false,
                    forceBlockedWorkers
                  })
                } else if (type === 'allow' && !forceAllowedWorkers) {
                  AppSettings.set('useAllowedWorkers', true)
                  AppSettings.set('useBlockedWorkers', false)
                  updateWorkerUsagePreference({
                    forceAllowedWorkers: true,
                    forceBlockedWorkers: false
                  })
                }

                if (type === 'block' && forceBlockedWorkers) {
                  AppSettings.set('useBlockedWorkers', false)
                  updateWorkerUsagePreference({
                    forceAllowedWorkers,
                    forceBlockedWorkers: false
                  })
                } else if (type === 'block' && !forceBlockedWorkers) {
                  AppSettings.set('useAllowedWorkers', false)
                  AppSettings.set('useBlockedWorkers', true)
                  updateWorkerUsagePreference({
                    forceAllowedWorkers: false,
                    forceBlockedWorkers: true
                  })
                }
              }}
            />
          </label>
        </div>
        <div className="w-full row">
          <SelectCombo
            disabled={userWorkersList.length >= MAX_ENTRIES}
            onChange={(option) => {
              if (!option) return
              setSelectedWorker(option.value as string)
            }}
            options={workerOptions}
            value={{
              label: workers.filter((w) => w.id === selectedWorker)[0]?.name,
              value: selectedWorker
            }}
          />
          <Button
            disabled={userWorkersList.length >= MAX_ENTRIES}
            onClick={() => {
              const option = {
                label: workers.filter((w) => w.id === selectedWorker)[0]?.name,
                value: selectedWorker
              }

              handleAddWorker(option)
              setSelectedWorker('')
            }}
          >
            <IconPlus />
          </Button>
        </div>
        {userWorkersList.length > 0 && (
          <div className="col gap-2">
            {userWorkersList.map((worker) => (
              <div
                key={worker.value}
                className="row w-full items-start justify-start gap-6"
              >
                <div className="pt-1">
                  <Button
                    onClick={() => removeWorkerFromList(worker)}
                    theme="danger"
                    style={{
                      height: '32px',
                      width: '32px'
                    }}
                  >
                    <IconX />
                  </Button>
                </div>
                <div className="col gap-0 font-mono">
                  <div className="font-bold !text-md">{worker.label}</div>
                  <div className="text-sm">{worker.timestamp}</div>
                  <div className="text-sm">{worker.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  )
}
