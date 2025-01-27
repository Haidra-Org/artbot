import NiceModal from '@ebay/nice-modal-react';
import {
  IconChevronDown,
  IconCopy,
  IconPoint,
  IconSquareRoundedCheck,
  IconSquareRoundedX
} from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { formatSeconds } from '../_utils/numberUtils';
import Linker from './Linker';
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
    </div>
  );
}
