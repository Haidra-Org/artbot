import { UserStore } from '@/app/_stores/UserStore';
import NiceModal from '@ebay/nice-modal-react';
import { IconMail } from '@tabler/icons-react';
import { useStore } from 'statery';
import Button from '../Button';
import {
  getReadMessagesIdsFromDexie,
  updateReadMessagesIdsInDexie
} from '@/app/_db/appSettings';
import { useEffect, useState } from 'react';

const HordeMessagesModal = ({ handleClose }: { handleClose: () => void }) => {
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
                  await handleClose();
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
  const [readMessages, setReadMessages] = useState<string[]>([]);
  const { hordeMessages } = useStore(UserStore);

  const getReadMessages = async () => {
    const ids = await getReadMessagesIdsFromDexie();
    setReadMessages(ids || []);
  };

  useEffect(() => {
    getReadMessages();
  }, []);

  if (hordeMessages.length === 0) {
    return null;
  }

  const hasUnreadMessages = hordeMessages.some(
    (msg) => !readMessages.includes(msg.id)
  );

  const handleModalClose = async () => {
    const messagesIds = hordeMessages.map((msg) => msg.id);
    await updateReadMessagesIdsInDexie(messagesIds);
    await getReadMessages();

    NiceModal.hide('modal');
  };

  return (
    <button
      className="row text-xs py-[4px] px-[6px] rounded-md text-black dark:text-white relative"
      onClick={() => {
        NiceModal.show('modal', {
          children: <HordeMessagesModal handleClose={handleModalClose} />,
          onClose: handleModalClose
        });
      }}
    >
      <IconMail stroke={1} size={22} />
      {hasUnreadMessages && (
        <div className="absolute top-[5px] right-[5px] w-2 h-2 bg-red-500 rounded-full" />
      )}
    </button>
  );
}
