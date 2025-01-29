'use client';

import MyWorkerSummary from '@/app/_components/MyWorkerSummary';
import PageTitle from '@/app/_components/PageTitle';
import useMyWorkerDetails from '@/app/_hooks/useMyWorkerDetails';
import { useEffect } from 'react';

export default function WorkersPage() {
  const { fetchAllWorkersDetails, workersDetails, worker_ids } =
    useMyWorkerDetails();

  useEffect(() => {
    fetchAllWorkersDetails();
  }, [fetchAllWorkersDetails]);

  return (
    <div className="col gap-2">
      <PageTitle>Manage Workers</PageTitle>
      <div>
        Please note, it can take up to 5 minutes before the changes are
        reflected in the worker list.
      </div>
      <div className="col gap-2">
        {(!workersDetails ||
          (workersDetails?.length === 0 && worker_ids?.length === 0)) && (
          <div>You have no active GPU workers.</div>
        )}
        {workersDetails?.length === 0 &&
          worker_ids &&
          worker_ids?.length > 0 && (
            <div className="my-2">
              <span className="loading loading-spinner loading-sm"></span>
              Loading worker details...
            </div>
          )}
        {worker_ids && worker_ids?.length > 0 && (
          <div className="flex flex-col gap-2">
            {workersDetails.map((worker) => {
              return <MyWorkerSummary key={worker.id} worker={worker} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
