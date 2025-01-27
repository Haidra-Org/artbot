'use client';

import { ChangeEvent, useState } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import { IconTrash } from '@tabler/icons-react';
import Section from './Section';
import Input from './Input';
import Select from './Select';
import { WorkerDetails } from '../_types/HordeTypes';

interface SelectOption {
  value: string | number;
  label: string;
}

export default function ModifyWorker({
  worker,
  teams,
  onUpdate,
  onDelete
}: {
  worker: WorkerDetails;
  teams: SelectOption[];
  onUpdate: (updates: Partial<WorkerDetails>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editMode, setEditMode] = useState<
    'name' | 'description' | 'team' | false
  >(false);
  const [workerName, setWorkerName] = useState(worker?.name || '');
  const [workerInfo, setWorkerInfo] = useState(worker?.info || '');
  // const [workerTeam, setWorkerTeam] = useState<
  //   [string | undefined, string | undefined]
  // >([worker?.team?.id, worker?.team?.name]);

  const updateWorkerDescription = async () => {
    await onUpdate({
      name: workerName,
      info: workerInfo
      // team: workerTeam[0]
      //   ? { id: workerTeam[0], name: workerTeam[1] || '' }
      //   : undefined
    });
  };

  const deleteWorker = async () => {
    await onDelete();
  };

  return (
    <Section className="mt-2 pb-2">
      <div className="collapse-content mt-2 p-0 w-full flex flex-col gap-2 items-start">
        {/* Name edit section */}
        <button
          className="btn btn-error btn-sm btn-link px-0"
          onClick={() => setEditMode('name')}
        >
          Rename worker?
        </button>
        {editMode === 'name' && (
          <div className="flex flex-col gap-2 p-2">
            <Input
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setWorkerName(e?.target?.value)
              }
              value={workerName}
            />
            <div className="flex flex-row gap-2">
              <button
                className="btn btn-secondary btn-sm btn-outline"
                onClick={() => {
                  setWorkerName(worker?.name || '');
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  if (workerName.trim() === '') {
                    setWorkerName(worker?.name || '');
                  }
                  await updateWorkerDescription();
                  setEditMode(false);
                }}
              >
                Update name
              </button>
            </div>
          </div>
        )}

        {/* Description edit section */}
        <button
          className="btn btn-error btn-sm btn-link px-0"
          onClick={() => setEditMode('description')}
        >
          Update description?
        </button>
        {editMode === 'description' && (
          <div className="flex flex-col gap-2 p-2">
            <Input
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setWorkerInfo(e?.target?.value)
              }
              value={workerInfo}
            />
            <div className="flex flex-row gap-2">
              <button
                className="btn btn-secondary btn-sm btn-outline"
                onClick={() => {
                  setWorkerInfo(worker?.info || '');
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  await updateWorkerDescription();
                  setEditMode(false);
                }}
              >
                Update description
              </button>
            </div>
          </div>
        )}

        {/* Team edit section */}
        <button
          className="btn btn-error btn-sm btn-link px-0"
          onClick={() => setEditMode('team')}
        >
          Update team?
        </button>
        {editMode === 'team' && (
          <div className="flex flex-col gap-2 p-2">
            <Select
              options={teams}
              onChange={() => {}}
              // onChange={(option: SelectOption) => {
              //   setWorkerTeam([option.value.toString(), option.label]);
              // }}
              value={{
                // value: workerTeam[0] || '',
                // label: workerTeam[1] || 'None'
                value: '',
                label: 'None'
              }}
            />
            <div className="flex flex-row gap-2">
              <button
                className="btn btn-secondary btn-sm btn-outline"
                onClick={() => {
                  // setWorkerTeam([worker?.team?.id, worker?.team?.name]);
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  await updateWorkerDescription();
                  setEditMode(false);
                }}
              >
                Update team
              </button>
            </div>
          </div>
        )}

        {/* Delete worker button */}
        <button
          className="btn btn-error btn-sm btn-link px-0 text-error"
          onClick={() => {
            NiceModal.show('confirmation-modal', {
              buttons: (
                <div className="flex flex-row justify-end gap-2">
                  <button
                    className="btn btn-secondary btn-outline"
                    onClick={() => {
                      NiceModal.remove('confirmation-modal');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-error"
                    onClick={async () => {
                      await deleteWorker();
                      NiceModal.remove('confirmation-modal');
                      NiceModal.remove('workerDetails-modal');
                    }}
                  >
                    DELETE
                  </button>
                </div>
              ),
              content: (
                <div>
                  <div className="flex flex-row gap-2 items-center justify-start">
                    <div className="flex h-8 w-8 justify-center items-center rounded-full bg-red-100">
                      <svg
                        className="h-6 w-6 text-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium" id="modal-title">
                      Delete this worker?
                    </h3>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      Are you sure you want to delete{' '}
                      <strong>{worker?.name}</strong>? This action will delete
                      the worker and all statistics associated with it. It will
                      not affect the amount of kudos generated by this worker
                      for your account.
                      <br />
                      <strong className="block pt-2">
                        This action cannot be undone.
                      </strong>
                    </p>
                  </div>
                </div>
              ),
              maxWidth: 'max-w-[480px]',
              title: 'Confirm delete worker'
            });
          }}
        >
          <IconTrash />
          Delete worker?
        </button>
      </div>
    </Section>
  );
}
