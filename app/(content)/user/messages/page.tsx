'use client';

import PageTitle from '@/app/_components/PageTitle';
import { AppSettings } from '@/app/_data-models/AppSettings';
import { getReadMessagesIdsFromDexie } from '@/app/_db/appSettings';
import { UserStore } from '@/app/_stores/UserStore';
import { useEffect, useState } from 'react';
import { useStore } from 'statery';

// export const metadata: Metadata = {
//   title: 'User Messages | ArtBot for Stable Diffusion'
// };

// async function getData() {
//   const res = await fetch('https://aihorde.net/api/v2/documents/terms');
//   const data = res.json();

//   return data;
// }

export default function UserMessagesPage() {
  const { hordeMessages } = useStore(UserStore);
  const [loading, setLoading] = useState(true);
  const [readMessages, setReadMessages] = useState<string[]>([]);

  const getReadMessages = async () => {
    const ids = await getReadMessagesIdsFromDexie();
    setReadMessages(ids || []);
    setLoading(false);
  };

  useEffect(() => {
    const apikey = AppSettings.apikey();
    if (apikey) {
      getReadMessages();
    }
  }, []);

  const apikey = AppSettings.apikey();
  const validApiKey = apikey && apikey.trim();

  return (
    <div>
      <PageTitle>Messages</PageTitle>
      <div className="pt-4 col gap-4">
        {loading && <div>Loading...</div>}
        {!loading && !validApiKey && <div>No messages.</div>}
        {!loading && hordeMessages.length === 0 && validApiKey && (
          <div>No messages.</div>
        )}
        {!loading && hordeMessages.length > 0 && (
          <div className="col gap-4">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
