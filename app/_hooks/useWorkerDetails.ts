import { useState, useCallback } from 'react';
import { WorkerDetails as HordeWorkerDetails } from '../_types/HordeTypes';
import { AppConstants } from '../_data-models/AppConstants';
import { AppSettings } from '../_data-models/AppSettings';
import { clientHeader } from '../_data-models/ClientHeader';

interface TeamLabel {
  label: string;
  value: string;
}

type WorkerTeam = [string | undefined, string | undefined];

export const useWorkerDetails = (id: string) => {
  const [teams, setTeams] = useState<TeamLabel[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [worker, setWorker] = useState<HordeWorkerDetails>();
  const [workerInfo, setWorkerInfo] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [workerTeam, setWorkerTeam] = useState<WorkerTeam>(['', '']);

  const fetchTeams = async () => {
    const res = await fetch(`${AppConstants.AI_HORDE_PROD_URL}/api/v2/teams`, {
      cache: 'no-store'
    });
    const details = await res.json();

    if (Array.isArray(details)) {
      const formatTeams: TeamLabel[] = details.map((team) => ({
        label: team.name,
        value: team.id
      }));

      formatTeams.sort((a, b) => a.label.localeCompare(b.label));

      formatTeams.unshift({
        label: 'None',
        value: ''
      });

      setTeams(formatTeams);
    }
  };

  const fetchWorkerDetails = async (workerId: string) => {
    const res = await fetch(
      `${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers/${workerId}`,
      {
        cache: 'no-store'
      }
    );
    const details = await res.json();

    if (res.status === 404) {
      setNotFound(true);
      return;
    }

    setWorker(details);
    setWorkerInfo(details.info);
    setWorkerName(details.name);
    setWorkerTeam([details.team.id, details.team.name]);
  };

  const deleteWorker = async () => {
    await fetch(`${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers/${id}`, {
      headers: {
        apikey: AppSettings.get('apiKey'),
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      method: 'DELETE'
    });
  };

  const updateWorkerDescription = async () => {
    await fetch(`${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers/${id}`, {
      body: JSON.stringify({
        info: workerInfo,
        name: workerName,
        team: workerTeam[0]
      }),
      headers: {
        apikey: AppSettings.get('apiKey'),
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      },
      method: 'PUT'
    });
  };

  const getWorkerState = useCallback((worker: HordeWorkerDetails) => {
    if (worker.online && !worker.maintenance_mode) return 'active';
    if (worker.online && worker.maintenance_mode) return 'paused';
    if (worker.loading) return 'loading';
    return 'offline';
  }, []);

  const getBadgeColor = useCallback(() => {
    if (!worker) return 'red';

    const stateColors = {
      active: 'green',
      paused: 'orange',
      loading: 'gray',
      offline: 'red'
    };

    return stateColors[getWorkerState(worker)];
  }, [worker, getWorkerState]);

  return {
    teams,
    notFound,
    worker,
    workerInfo,
    workerName,
    workerTeam,
    fetchTeams,
    fetchWorkerDetails,
    deleteWorker,
    updateWorkerDescription,
    setWorkerInfo,
    setWorkerName,
    setWorkerTeam,
    getBadgeColor
  };
};
