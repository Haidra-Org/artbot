import {
  IconInfoCircle,
  IconMinusVertical,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconPoint
} from '@tabler/icons-react';
import { ManageWorker } from '../_data-models/ManageWorker';
import useMyWorkerDetails from '../_hooks/useMyWorkerDetails';
import { WorkerDetails } from '../_types/HordeTypes';
import Button from './Button';
import NiceModal from '@ebay/nice-modal-react';
import WorkerDetailsCard from './WorkerDetailsCard';
import ModifyWorker from './ModifyWorker';
import { useEffect, useState } from 'react';

export default function MyWorkerSummary({ worker }: { worker: WorkerDetails }) {
  const { id } = worker;
  const { fetchAllWorkersDetails, handleWorkerChange } = useMyWorkerDetails();
  const [workerState, setWorkerState] = useState('paused');
  const [workerBadgeColor, setWorkerBadgeColor] = useState(
    ManageWorker.getBadgeColor(worker)
  );

  const kph = worker.uptime
    ? Math.floor(worker.kudos_rewards / (worker.uptime / 3600))
    : false;

  useEffect(() => {
    const initWorkerState = ManageWorker.getWorkerState(worker) || 'paused';
    setWorkerState(initWorkerState);
  }, [worker]);

  return (
    <div className="bg-zinc-400 dark:bg-zinc-700 rounded-lg text-white font-mono font-semibold p-2">
      <div className="flex flex-row gap-2 items-center mb-2">
        <div className="flex flex-row gap-2">
          <Button
            disabled={workerState === 'offline' || workerState === 'loading'}
            onClick={() => {
              if (worker.loading || workerState === 'offline') {
                return;
              }

              // Send API request to change worker state
              handleWorkerChange({ workerId: id });

              // Optimistic updates
              if (workerState === 'active') {
                setWorkerState('paused');
                setWorkerBadgeColor('orange');
              } else {
                setWorkerState('active');
                setWorkerBadgeColor('green');
              }
            }}
          >
            {worker.loading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {!worker.loading && workerState === 'active' && <IconPlayerPause />}
            {!worker.loading && workerState === 'paused' && <IconPlayerPlay />}
            {!worker.loading && workerState === 'offline' && <IconPlayerPlay />}
          </Button>
          <Button
            className="btn btn-sm btn-square btn-primary cursor-pointer"
            onClick={() => {
              NiceModal.show('workerDetails', {
                buttons: (
                  <div className="flex flex-row justify-end gap-4">
                    <button
                      className="btn"
                      onClick={() => {
                        NiceModal.remove('workerDetails');
                        fetchAllWorkersDetails();
                      }}
                    >
                      OK
                    </button>
                  </div>
                ),
                children: <WorkerDetailsCard edit worker={worker} />,
                handleClose: fetchAllWorkersDetails,
                title: 'Worker Details',
                modalStyle: {
                  maxWidth: '1024px',
                  width: 'calc(100% - 32px)'
                }
              });
            }}
          >
            <IconInfoCircle stroke={1.5} />
          </Button>
          <Button
            className="btn btn-sm btn-square btn-primary cursor-pointer"
            onClick={() => {
              NiceModal.show('modifyWorker', {
                buttons: (
                  <div className="flex flex-row justify-end gap-4">
                    <button
                      className="btn"
                      onClick={() => {
                        NiceModal.remove('modifyWorker');
                        fetchAllWorkersDetails();
                      }}
                    >
                      OK
                    </button>
                  </div>
                ),
                children: (
                  <ModifyWorker
                    onDelete={() => Promise.resolve()}
                    onUpdate={() => fetchAllWorkersDetails()}
                    teams={[]}
                    worker={worker}
                  />
                ),
                handleClose: fetchAllWorkersDetails,
                title: 'Modify Worker',
                modalStyle: {
                  maxWidth: '1024px',
                  width: 'calc(100% - 32px)'
                }
              });
            }}
          >
            <IconPencil stroke={1.5} />
          </Button>
        </div>
        <div className="flex flex-row gap-0" title={workerState}>
          <IconPoint stroke="white" fill={workerBadgeColor} />
          {worker.name}
        </div>
      </div>
      <div className="flex flex-row gap-2 text-xs sm:text-sm">
        <div>{worker?.requests_fulfilled?.toLocaleString()} images</div>
        <div className="text-primary">
          <IconMinusVertical />
        </div>
        {kph && (
          <>
            <div>{kph.toLocaleString()} kudos/hr</div>
            <div className="text-primary">
              <IconMinusVertical />
            </div>
          </>
        )}
        <div>{worker?.performance?.split(' ')[0]} MPS/s</div>
      </div>
    </div>
  );
}
