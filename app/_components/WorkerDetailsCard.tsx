import NiceModal from '@ebay/nice-modal-react';
import {
  IconChevronDown,
  IconCopy,
  IconPoint,
  IconSquareRoundedCheck,
  IconSquareRoundedX,
  IconTrash
} from '@tabler/icons-react';
import { ChangeEvent, useRef, useState } from 'react';
import { formatSeconds } from '../_utils/numberUtils';
import Linker from './Linker';
import Input from './Input';
import Select, { SelectOption } from './Select';
import { toastController } from '../_controllers/toastController';
import { useWorkerDetails } from '../_hooks/useWorkerDetails';
import { WorkerDetails } from '../_types/HordeTypes';
import { Accordion, AccordionItem as Item } from '@szhsin/react-accordion';
import Section from './Section';

const AccordionItem = ({
  children,
  header,
  initialEntered,
  style,
  ...rest
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  initialEntered?: boolean;
  style?: React.CSSProperties;
}) => (
  <Item
    {...rest}
    initialEntered={initialEntered}
    style={style}
    header={({ state: { isEnter } }) => (
      <>
        <IconChevronDown
          className={`transition-transform duration-200 ease-out text-white ${
            isEnter && 'rotate-180'
          }`}
        />
        {header}
      </>
    )}
    buttonProps={{
      className: () => `flex w-full items-center py-2 text-left`
    }}
    contentProps={{
      className: 'transition-height duration-200 ease-out'
    }}
  >
    {children}
  </Item>
);

export default function WorkerDetailsCard({
  edit,
  worker = {} as WorkerDetails
}: {
  edit?: boolean;
  handleClose?: () => void;
  worker: WorkerDetails;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [editMode, setEditMode] = useState<string | boolean>(false);

  const {
    teams,
    notFound,
    workerInfo,
    workerTeam,
    deleteWorker,
    updateWorkerDescription,
    setWorkerInfo,
    setWorkerName,
    setWorkerTeam
  } = useWorkerDetails(worker?.id);

  const workerName = worker?.name;

  // useEffect(() => {
  //   if (edit) {
  //     fetchTeams();
  //   }
  // }, [edit, worker?.id, fetchTeams]);

  if (notFound) {
    return <div>No worker found...</div>;
  }

  if (!worker) {
    return <div>Loading...</div>;
  }

  const kph = worker?.uptime
    ? Math.floor(worker?.kudos_rewards / (worker?.uptime / 3600))
    : false;

  const sortedModels =
    worker?.models?.sort((a = '', b = '') =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    ) ?? [];

  let badgeColor = 'gray';

  if (worker?.online && !worker?.maintenance_mode) badgeColor = 'green';
  if (worker?.online && worker?.maintenance_mode) badgeColor = 'orange';

  return (
    <div ref={containerRef}>
      <div className="flex flex-row gap-2">
        <IconPoint stroke="white" fill={badgeColor} />
        {workerName}
      </div>
      <div
        className="flex flex-row gap-2 text-xs items-center pl-2 cursor-pointer font-mono"
        onClick={() => {
          navigator?.clipboard?.writeText(`${worker?.id}`).then(() => {
            toastController({
              message: 'Worker ID copied!'
            });
          });
        }}
      >
        <IconCopy stroke={1} size={16} />
        id: {worker?.id}
      </div>
      {workerInfo && <div className="mt-2 text-sm italic">{workerInfo}</div>}
      <div className="text-sm pt-2">
        Status:{' '}
        <strong>
          {worker?.online && worker?.maintenance_mode && 'Paused'}
          {worker?.online && !worker?.maintenance_mode && 'Online'}
          {!worker?.online && 'Offline'}
        </strong>
      </div>
      <div className="text-sm pt-2 flex flex-row gap-2 items-center flex-wrap">
        Bridge:
        <div className="text-xs font-mono">
          {worker?.bridge_agent?.split(':')?.slice(0, 2)?.join(':')}
        </div>
      </div>
      <div className="text-sm">
        {workerTeam[0] && (
          <div>
            Worker team:{' '}
            <span className="font-mono text-xs">{workerTeam[1]}</span>
          </div>
        )}
        Total uptime: <strong>{formatSeconds(worker?.uptime)}</strong>
      </div>
      <div className="text-sm pt-2">
        <div>
          Threads: <strong>{worker?.threads}</strong>
        </div>
        <div>
          Max resolution (1:1):{' '}
          <strong>
            {Math.floor(Math.sqrt(worker?.max_pixels))} x{' '}
            {Math.floor(Math.sqrt(worker?.max_pixels))}
          </strong>
        </div>
        <div>
          Max pixels: <strong>{worker?.max_pixels?.toLocaleString()}</strong>
        </div>
        <div>
          Performance: <strong>{worker?.performance}</strong>
        </div>
        <div>
          Avg time per request:{' '}
          <strong>
            {worker?.requests_fulfilled > 0
              ? `${Number(worker?.uptime / worker?.requests_fulfilled).toFixed(
                  4
                )} seconds`
              : 'N/A'}
          </strong>
        </div>
      </div>
      <div className="text-sm pt-2">
        <div>
          Kudos earned:{' '}
          <strong>{worker?.kudos_rewards?.toLocaleString()}</strong>
        </div>
        <div>
          Kudos rate: <strong>{kph?.toLocaleString()} kudos per hour</strong>
        </div>
        <div>
          Images generated:{' '}
          <strong>{worker?.requests_fulfilled?.toLocaleString()}</strong>
        </div>
      </div>
      <div className="text-sm pt-2">
        <table>
          <tbody>
            <tr>
              <td>Trusted:&nbsp;&nbsp;</td>
              <td>
                <strong>
                  {worker?.trusted ? (
                    <div style={{ color: 'green' }}>
                      <IconSquareRoundedCheck />
                    </div>
                  ) : (
                    <div style={{ color: 'red' }}>
                      <IconSquareRoundedX />
                    </div>
                  )}
                </strong>
              </td>
            </tr>
            <tr>
              <td>Inpainting:&nbsp;&nbsp;</td>
              <td>
                {
                  <strong>
                    {worker?.painting ? (
                      <div style={{ color: 'green' }}>
                        <IconSquareRoundedCheck />
                      </div>
                    ) : (
                      <div style={{ color: 'red' }}>
                        <IconSquareRoundedX />
                      </div>
                    )}
                  </strong>
                }
              </td>
            </tr>
            <tr>
              <td>NSFW:&nbsp;&nbsp;</td>
              <td>
                {
                  <strong>
                    {worker?.nsfw ? (
                      <div style={{ color: 'green' }}>
                        <IconSquareRoundedCheck />
                      </div>
                    ) : (
                      <div style={{ color: 'red' }}>
                        <IconSquareRoundedX />
                      </div>
                    )}
                  </strong>
                }
              </td>
            </tr>
            <tr>
              <td>Post-processing:&nbsp;&nbsp;</td>
              <td>
                <strong>
                  {worker?.['post-processing'] ? (
                    <div style={{ color: 'green' }}>
                      <IconSquareRoundedCheck />
                    </div>
                  ) : (
                    <div style={{ color: 'red' }}>
                      <IconSquareRoundedX />
                    </div>
                  )}
                </strong>
              </td>
            </tr>
            <tr>
              <td>LORA:&nbsp;&nbsp;</td>
              <td>
                <strong>
                  {worker?.lora ? (
                    <div style={{ color: 'green' }}>
                      <IconSquareRoundedCheck />
                    </div>
                  ) : (
                    <div style={{ color: 'red' }}>
                      <IconSquareRoundedX />
                    </div>
                  )}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Section className="mt-2 pb-2">
        <Accordion transition transitionTimeout={150}>
          <AccordionItem
            header={
              <div className="row font-bold text-sm gap-1 text-white">
                Available models ({worker?.models?.length})
              </div>
            }
            style={{
              marginBottom: '-8px'
            }}
          >
            <ul>
              {sortedModels.map((model: string) => {
                return (
                  <li key={`${model}`}>
                    <Linker
                      href={`/info/models#${model}`}
                      inverted
                      onClick={() => NiceModal.remove('workerDetails')}
                    >
                      {model}
                    </Linker>
                  </li>
                );
              })}
            </ul>
          </AccordionItem>
        </Accordion>
      </Section>
      {edit && (
        <Section className="mt-2 pb-2">
          <Accordion transition transitionTimeout={150}>
            <AccordionItem
              header={
                <div className="flex flex-row font-bold text-sm gap-1 text-white">
                  Advanced options
                </div>
              }
              style={{
                marginBottom: '-8px'
              }}
            >
              <div className="collapse-content mt-2 p-0 w-full flex flex-col gap-2 items-start">
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
                          setWorkerName(worker?.name);
                          setEditMode(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={async () => {
                          if (workerName.trim() === '') {
                            setWorkerName(worker?.name);
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
                          setWorkerInfo(worker?.info);
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
                      onChange={(option: SelectOption) => {
                        setWorkerTeam([option.value.toString(), option.label]);
                      }}
                      value={{
                        value: workerTeam[0] || '',
                        label: workerTeam[1] || 'None'
                      }}
                    />
                    <div className="flex flex-row gap-2">
                      <button
                        className="btn btn-secondary btn-sm btn-outline"
                        onClick={() => {
                          setWorkerTeam([
                            worker?.team?.id || undefined,
                            worker?.team?.name || undefined
                          ]);
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
                <button
                  className="btn btn-error btn-sm btn-link px-0 text-error"
                  onClick={() => {
                    NiceModal.show('confirmation-modal', {
                      buttons: (
                        <div className="flex flex-row justify-end gap-2">
                          <div className="flex flex-row justify-end gap-4">
                            <button
                              className="btn btn-secondary btn-outline"
                              onClick={() => {
                                NiceModal.remove('confirmation-modal');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="flex flex-row justify-end gap-4">
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
                        </div>
                      ),
                      content: (
                        <div className="">
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
                            <h3
                              className="text-lg font-medium"
                              id="modal-title"
                            >
                              Delete this worker?
                            </h3>
                          </div>
                          <div className="text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <div className="mt-2">
                              <p className="text-sm">
                                Are you sure you want to delete{' '}
                                <strong>{worker?.name}</strong>? This action
                                will delete the worker and all statistics
                                associated with it. It will not affect the
                                amount of kudos generated by this worker for
                                your account.
                                <br />
                                <p className="pt-2">
                                  <strong>This action cannot be undone.</strong>
                                </p>
                              </p>
                            </div>
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
            </AccordionItem>
          </Accordion>
        </Section>
      )}
    </div>
  );
}
