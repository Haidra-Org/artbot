import { fetchHordeWorkers } from '@/app/_api/horde/workers'
import Button from '@/app/_components/Button'
import SelectCombo from '@/app/_components/ComboBox'
import { setForceSelectedWorker } from '@/app/_stores/UserStore'
import { HordeWorker } from '@/app/_types/HordeTypes'
import NiceModal from '@ebay/nice-modal-react'
import { IconArrowBarLeft, IconPlus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export default function ForceWorkerModal() {
  const [selectedWorker, setSelectedWorker] = useState<string>('')
  const [workers, setWorkers] = useState<HordeWorker[]>([])

  useEffect(() => {
    async function fetchWorkers() {
      const result = await fetchHordeWorkers()
      setWorkers(result)
    }

    fetchWorkers()
  }, [])

  useEffect(() => {
    const worker = sessionStorage.getItem('forceSelectedWorker')

    if (worker) {
      setForceSelectedWorker(true)
      setSelectedWorker(worker || '')
    }
  }, [])

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

  return (
    <div className="col w-full h-full">
      <h2 className="row font-bold">Force Worker</h2>
      <div className="col gap-2">
        <div>
          Temporarily send requests to a <strong>specific worker</strong>. This
          will <strong>override</strong> any current worker preference options
          that you may have set. Clearing this option will restore your previous
          worker preferences.
        </div>
        <div>
          This setting will affect any images that are queued up and awaiting to
          be sent to the AI Horde.
        </div>
        <div className="w-full row">
          <SelectCombo
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
            onClick={() => {
              if (!selectedWorker) {
                sessionStorage.setItem('forceSelectedWorker', '')
              } else {
                setForceSelectedWorker(true)
                sessionStorage.setItem('forceSelectedWorker', selectedWorker)
              }
              NiceModal.remove('modal')
            }}
          >
            <IconPlus />
          </Button>
          <Button
            theme="danger"
            onClick={() => {
              setSelectedWorker('')
              sessionStorage.setItem('forceSelectedWorker', '')
              setForceSelectedWorker(false)
            }}
          >
            <IconArrowBarLeft />
          </Button>
        </div>
      </div>
    </div>
  )
}
