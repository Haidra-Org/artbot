import { UserStore } from '@/app/_stores/UserStore';
import NiceModal from '@ebay/nice-modal-react';
import { IconMail, IconMailCheck } from '@tabler/icons-react';
import { useStore } from 'statery';
import Button from '../Button';
import {
  getReadMessagesIdsFromDexie,
  updateReadMessagesIdsInDexie
} from '@/app/_db/appSettings';
import { useEffect, useState } from 'react';
import HeaderNav_IconWrapper from './_HeaderNav_IconWrapper';
import { HordeUser } from '@/app/_types/HordeTypes';

const HordeMessagesModal = ({ handleClose }: { handleClose: () => void }) => {
  const { hordeMessages } = useStore(UserStore);
  const [readMessages, setReadMessages] = useState<string[]>([]);

  useEffect(() => {
    const getReadMessages = async () => {
      const ids = await getReadMessagesIdsFromDexie();
      setReadMessages(ids || []);
    };
    getReadMessages();
  }, []);

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
            {hordeMessages.map((msg, index) => {
              const isUnread = !readMessages.includes(msg.id);
              const isLastMessage = index === hordeMessages.length - 1;
              return (
                <div
                  key={msg.id}
                  style={{
                    ...(isLastMessage
                      ? {}
                      : {
                          borderBottom: '1px solid gray',
                          paddingBottom: '6px',
                          marginBottom: '2px'
                        })
                  }}
                >
                  <div className="font-bold text-sm flex items-center gap-2">
                    {isUnread && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                    {msg.origin}
                  </div>
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
                <div className="row items-center gap-2">
                  <IconMailCheck stroke={1} size={24} /> Close
                </div>
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
  const { hordeMessages, userDetails = {} as HordeUser } = useStore(UserStore);
  const { worker_count } = userDetails;

  console.log(`user`);

  const getReadMessages = async () => {
    const ids = await getReadMessagesIdsFromDexie();
    setReadMessages(ids || []);
  };

  useEffect(() => {
    getReadMessages();
  }, []);

  if (hordeMessages.length === 0 || !worker_count) {
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
    <HeaderNav_IconWrapper
      onClick={() => {
        NiceModal.show('modal', {
          children: <HordeMessagesModal handleClose={handleModalClose} />,
          onClose: handleModalClose
        });
      }}
      title="AI Horde messages"
    >
      <IconMail stroke={1} size={22} />
      {hasUnreadMessages && (
        <div className="absolute top-[5px] right-[5px] w-2 h-2 bg-red-500 rounded-full" />
      )}
    </HeaderNav_IconWrapper>
  );
}
