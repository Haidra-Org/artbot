import {
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

export default function MyWorkerSummary({ worker }: { worker: WorkerDetails }) {
  const { id } = worker;
  const workerState = ManageWorker.getWorkerState(worker);
  const workerBadgeColor = ManageWorker.getBadgeColor(worker);
  const { fetchAllWorkersDetails, handleWorkerChange } = useMyWorkerDetails();

  const kph = worker.uptime
    ? Math.floor(worker.kudos_rewards / (worker.uptime / 3600))
    : false;

  return (
    <div className="bg-neutral-500 rounded-lg text-white font-mono font-semibold p-2">
      <div className="flex flex-row gap-2 items-center mb-2">
        <div className="flex flex-row gap-2">
          <Button
            disabled={workerState === 'offline' || workerState === 'loading'}
            onClick={() => {
              if (worker.loading || workerState === 'offline') {
                return;
              }

              handleWorkerChange({ workerId: id });
            }}
            // size="square-small"
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
            // size="square-small"
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
                content: <WorkerDetailsCard edit id={worker.id} />,
                handleClose: fetchAllWorkersDetails,
                maxWidth: 'max-w-[480px]',
                title: 'Worker Details'
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
