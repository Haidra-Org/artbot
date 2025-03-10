import { useCallback, useEffect, useState } from 'react';
import { AppConstants } from '../_data-models/AppConstants';
import { HordeUser, WorkerDetails } from '../_types/HordeTypes';
import { useStore } from 'statery';
import { UserStore } from '../_stores/UserStore';
import { clientHeader } from '../_data-models/ClientHeader';
import { AppSettings } from '../_data-models/AppSettings';
import { sleep } from '../_utils/sleep';
import { ManageWorker } from '../_data-models/ManageWorker';

interface CacheEntry {
  data: WorkerDetails;
  timestamp: number;
}

// Cache object outside the hook to persist across renders
const workerCache: Record<string, CacheEntry> = {};
const CACHE_TIMEOUT = 30000;

export default function useMyWorkerDetails() {
  const store = useStore(UserStore) || {};
  const { userDetails = {} as HordeUser } = store;
  const { worker_ids = [] } = userDetails;
  const [workersDetails, setWorkersDetails] = useState<WorkerDetails[]>([]);

  const fetchWorkerDetails = async (workerId: string) => {
    try {
      const cachedData = workerCache[workerId];
      const now = Date.now();

      if (cachedData && now - cachedData.timestamp < CACHE_TIMEOUT) {
        return cachedData.data;
      }

      const res = await fetch(
        `${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers/${workerId}`,
        {
          cache: 'no-store'
        }
      );
      const workerDetails = await res.json();

      if (res.status === 404) {
        return {
          notFound: true
        };
      }

      workerCache[workerId] = {
        data: workerDetails,
        timestamp: now
      };

      return workerDetails;
    } catch (err) {
      console.log(`Error: Unable to fetch worker details`);
      console.log(err);
      return {
        notFound: true
      };
    }
  };

  const fetchAllWorkersDetails = useCallback(async () => {
    try {
      if (!worker_ids) return;

      // Create an array to hold all the fetch promises
      const fetchPromises = worker_ids.map((id) => fetchWorkerDetails(id));

      // Use Promise.all to wait for all fetches to complete
      let results = await Promise.all(fetchPromises);
      results = results.filter((result) => !result.notFound);

      // Sort the results first by online status and then by requests_fulfilled
      results = results.sort((a, b) => {
        // Sort by online status first (true values first)
        if (a.online && !b.online) {
          return -1;
        }
        if (!a.online && b.online) {
          return 1;
        }
        // If online status is the same, then sort by requests_fulfilled (higher values first)
        return b.requests_fulfilled - a.requests_fulfilled;
      });

      // Update the state with all the worker details
      setWorkersDetails(results);
    } catch (error) {
      console.error('Failed to fetch worker details:', error);
    }
  }, [worker_ids]);

  const handleWorkerChange = async ({ workerId }: { workerId: string }) => {
    const worker = workersDetails.find((worker) => worker.id === workerId);

    if (!worker) {
      return;
    }

    const workerState = ManageWorker.getWorkerState(worker);

    if (workerState === 'loading') {
      return;
    }

    // Set the loading state for the specific worker
    setWorkersDetails((prevDetails) =>
      prevDetails.map((worker: WorkerDetails) =>
        worker.id === workerId ? { ...worker, loading: true } : worker
      )
    );

    let tempNewState: 'active' | 'paused' | 'offline' = 'active';
    if (workerState === 'active') {
      tempNewState = 'paused';
    }

    if (workerState === 'paused') {
      tempNewState = 'active';
    }

    if (workerState === 'offline') {
      tempNewState = 'active';
    }

    try {
      const response = await fetch(
        `${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers/${workerId}`,
        {
          body: JSON.stringify({
            maintenance: tempNewState === 'paused' ? true : false,
            name: worker.name,
            team: worker.team?.id ?? ''
          }),
          headers: {
            apikey: AppSettings.get('apiKey'),
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader()
          },
          method: 'PUT'
        }
      );

      // Horde server returns a 500 response for this for some reason.
      if (response.ok || response.status === 500) {
        setWorkersDetails((prevDetails) =>
          prevDetails.map((worker: WorkerDetails) =>
            worker.id === workerId
              ? {
                  ...worker,
                  loading: false,
                  maintenance_mode: tempNewState !== 'active' ? true : false
                }
              : worker
          )
        );

        // Not sure I like this artificial delay
        await sleep(6000);
        await fetchAllWorkersDetails();
      }
    } catch (error) {
      console.error('Failed to update worker state:', error);
    }
  };

  useEffect(() => {
    fetchAllWorkersDetails();
    // Don't want to fetch workers details on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    fetchAllWorkersDetails,
    handleWorkerChange,
    workersDetails,
    worker_ids
  };
}
