import { UserStore } from '@/app/_stores/UserStore';
import NiceModal from '@ebay/nice-modal-react';
import { IconMail } from '@tabler/icons-react';
import { useStore } from 'statery';
import Button from '../Button';
import { updateReadMessagesIdsInDexie } from '@/app/_db/appSettings';

const HordeMessagesModal = () => {
  const { hordeMessages } = useStore(UserStore);

  return (
    <div
      className="flex flex-col gap-2"
      style={{ maxWidth: '600px', width: '100%' }}
    >
      <div className="stats bg-body-color">
        <div className="stat">
          <div className="font-bold pb-2 flex flex-row items-center gap-2 text-black dark:text-white">
            <IconMail stroke={1} size={24} />
            Messages
          </div>
          <div className="col gap-2">
            {hordeMessages.map((msg) => {
              return (
                <div
                  key={msg.id}
                  style={{
                    borderBottom: '1px solid gray',
                    paddingBottom: '6px',
                    marginBottom: '2px'
                  }}
                >
                  <div className="font-bold text-sm">{msg.origin}</div>
                  <div className="text-xs text-secondary pb-2">
                    {new Date(msg.expiry).toLocaleString()}
                  </div>
                  <div className="text-secondary">{msg.message}</div>
                </div>
              );
            })}
            <div className="w-full row justify-end">
              <Button
                onClick={async () => {
                  const messagesIds = hordeMessages.map((msg) => msg.id);
                  await updateReadMessagesIdsInDexie(messagesIds);

                  NiceModal.hide('modal');
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HeaderNav_Messages() {
  const { hordeMessages } = useStore(UserStore);

  if (hordeMessages.length === 0) {
    return null;
  }

  console.log(hordeMessages);

  return (
    <button
      className="row text-xs py-[4px] px-[6px] rounded-md text-black dark:text-white"
      onClick={() => {
        NiceModal.show('modal', {
          children: <HordeMessagesModal />
        });
      }}
    >
      <IconMail stroke={1} size={24} />
    </button>
  );
}
