'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { IconTrash } from '@tabler/icons-react';
import Input from './Input';
import { WorkerDetails } from '../_types/HordeTypes';
import Button from './Button';
import DeleteConfirmation from './Modal_DeleteConfirmation';
import { clientHeader } from '../_data-models/ClientHeader';
import { AppSettings } from '../_data-models/AppSettings';
import { AppConstants } from '../_data-models/AppConstants';
import { fetchTeams } from '../_data-models/HordeTeams';
import { SelectOption } from './ComboBox';
import Select from './Select';

export default function ModifyWorker({
  worker,
  onAfterUpdate
}: {
  worker: WorkerDetails;
  teams: SelectOption[];
  onAfterUpdate: () => void;
}) {
  const [workerName, setWorkerName] = useState(worker?.name || '');
  const [workerInfo, setWorkerInfo] = useState(worker?.info || '');
  const [workerTeam, setWorkerTeam] = useState<{ name: string; id: string }>({
    name: worker?.team?.name || 'None',
    id: worker?.team?.id || ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [hordeTeams, setHordeTeams] = useState<SelectOption[]>([]);

  const initHordeTeams = async () => {
    const teams = await fetchTeams();
    setHordeTeams(teams);
  };

  const updateWorker = async () => {
    const payload: { info: string; name: string; team?: string } = {
      info: workerInfo,
      name: workerName,
      team: ''
    };

    if (workerTeam.id) {
      payload.team = workerTeam.id;
    }

    try {
      await fetch(
        `${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers/${worker.id}`,
        {
          body: JSON.stringify(payload),

          headers: {
            apikey: AppSettings.get('apiKey'),
            'Content-Type': 'application/json',
            'Client-Agent': clientHeader()
          },
          method: 'PUT'
        }
      );
    } catch (error) {
      console.error('Error updating worker:', error);
    }

    NiceModal.remove('modifyWorker');
    onAfterUpdate();
  };

  const handleDelete = async () => {
    await fetch(
      `${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers/${worker?.id}`,
      {
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        },
        method: 'DELETE'
      }
    );
  };

  const handleInputChange = (field: 'name' | 'info', value: string) => {
    if (field === 'name') {
      setWorkerName(value);
    } else {
      setWorkerInfo(value);
    }
    setHasChanges(true);
  };

  useEffect(() => {
    initHordeTeams();
  }, []);

  return (
    <div className="mt-2 pb-2">
      <h2 className="row font-bold mb-4">Modify Worker</h2>
      <div className="flex flex-col gap-4 w-full">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Worker Name</span>
          </label>
          <Input
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInputChange('name', e.target.value)
            }
            value={workerName}
            placeholder="Enter worker name"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            className="bg-gray-50 border border-gray-300 text-gray-900 text-[16px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-2"
            value={workerInfo}
            onChange={(e) => handleInputChange('info', e.target.value)}
            placeholder="Enter worker description"
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Team</span>
          </label>
          <Select
            options={hordeTeams}
            onChange={(obj) => {
              setHasChanges(true);
              setWorkerTeam({
                name: obj.label,
                id: obj.value as string
              });
            }}
            value={{
              value: workerTeam.id,
              label: workerTeam.name
            }}
          />
        </div>

        <div className="text-sm text-gray-500">
          Please note, it can take up to 5 minutes before the changes are
          reflected in the worker list.
        </div>

        <div className="flex flex-row justify-between mt-4">
          <Button
            className="btn btn-error btn-outline gap-2"
            theme="danger"
            onClick={async () => {
              NiceModal.show('delete', {
                children: (
                  <div
                    className="col gap-4"
                    style={{ maxWidth: '400px', width: '100%' }}
                  >
                    <DeleteConfirmation
                      deleteButtonTitle="Delete"
                      title="Delete worker?"
                      message={
                        <>
                          <p className="text-sm">
                            Are you sure you want to delete{' '}
                            <strong>{worker?.name}</strong>? This action will
                            delete the worker and all statistics associated with
                            it. It will not affect the amount of kudos generated
                            by this worker for your account.
                            <br />
                            <strong className="block pt-2">
                              This action cannot be undone.
                            </strong>
                          </p>
                        </>
                      }
                      onDelete={async () => {
                        await handleDelete();
                        await onAfterUpdate();
                        NiceModal.remove('delete');
                        NiceModal.remove('modifyWorker');
                      }}
                    />
                  </div>
                )
              });
            }}
          >
            <IconTrash />
            Delete Worker
          </Button>

          <div className="flex flex-row gap-2">
            <Button
              className="btn btn-primary"
              onClick={() => {
                NiceModal.remove('modifyWorker');
              }}
            >
              Cancel
            </Button>
            <Button
              className="btn btn-primary"
              onClick={updateWorker}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
