import { WorkerDetails } from '../_types/HordeTypes';

export class ManageWorker {
  static getBadgeColor = (worker: WorkerDetails) => {
    const workerState = ManageWorker.getWorkerState(worker);
    let workerBadgeColor = 'red';

    if (workerState === 'active') {
      workerBadgeColor = 'green';
    }

    if (workerState === 'paused') {
      workerBadgeColor = 'orange';
    }

    if (workerState === 'loading') {
      workerBadgeColor = 'gray';
    }

    return workerBadgeColor;
  };

  static getWorkerState = (worker: WorkerDetails) => {
    if (worker.online && !worker.maintenance_mode) {
      return 'active';
    }

    if (worker.online && worker.maintenance_mode) {
      return 'paused';
    }

    if (worker.loading) {
      return 'loading';
    }

    if (!worker.online) {
      return 'offline';
    }
  };
}
