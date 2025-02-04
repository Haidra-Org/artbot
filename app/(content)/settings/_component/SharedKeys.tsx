'use client';
import Button from '@/app/_components/Button';
import DeleteConfirmation from '@/app/_components/Modal_DeleteConfirmation';
import Section from '@/app/_components/Section';
import { toastController } from '@/app/_controllers/toastController';
import { AppConstants } from '@/app/_data-models/AppConstants';
import { AppSettings } from '@/app/_data-models/AppSettings';
import { clientHeader } from '@/app/_data-models/ClientHeader';
import NiceModal from '@ebay/nice-modal-react';
import {
  IconCopy,
  IconEdit,
  IconLink,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import AddEditSharedKey from './AddEditSharedKey';
import { sleep } from '@/app/_utils/sleep';
import { SharedApiKey } from '@/app/_types/HordeTypes';
import { getBaseUrl } from '@/app/_utils/urlUtils';
import { useStore } from 'statery';
import { UserStore } from '@/app/_stores/UserStore';

export default function SharedKeys() {
  const { sharedKey } = useStore(UserStore);
  const [sharedKeys, setSharedKeys] = useState<SharedApiKey[]>([]);

  const fetchSharedKeys = useCallback(async () => {
    if (sharedKey) return;

    const apikey = AppSettings.apikey()?.trim();
    if (!apikey || apikey === AppConstants.AI_HORDE_ANON_KEY) return;

    const res = await fetch(`https://aihorde.net/api/v2/find_user`, {
      cache: 'no-store',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader(),
        apikey: apikey
      }
    });

    if (res.ok) {
      const data = await res.json();
      const { sharedkey_ids = [] } = data;

      try {
        // Fetch all shared keys in parallel and parse each response as JSON
        const sharedKeyPromises = sharedkey_ids.map((id: string) =>
          fetch(`https://aihorde.net/api/v2/sharedkeys/${id}`, {
            cache: 'no-store',
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Client-Agent': clientHeader(),
              apikey: apikey
            }
          }).then((res) => {
            if (!res.ok) {
              throw new Error(`Failed to fetch shared key with id: ${id}`);
            }
            return res.json();
          })
        );

        // Wait for all requests to complete and parse their JSON bodies
        const sharedKeyData = (await Promise.all(
          sharedKeyPromises
        )) as SharedApiKey[];

        // Update the state with the fetched shared keys
        setSharedKeys(sharedKeyData);
      } catch (error) {
        console.error('Error fetching shared keys:', error);
        // Handle error (e.g., set an error state, log, etc.)
      }
    }
  }, [sharedKey]);

  const handleCreateSharedKey = async ({
    id,
    name,
    kudos
  }: {
    id?: string;
    name: string;
    kudos: number;
  }) => {
    const apikey = AppSettings.apikey()?.trim();
    const payload: Partial<SharedApiKey> = {
      name: String(name),
      kudos: Number(kudos)
    };

    let url = `https://aihorde.net/api/v2/sharedkeys`;
    const method = id ? 'PATCH' : 'PUT';

    if (id) {
      url = `https://aihorde.net/api/v2/sharedkeys/${id}`;
      payload.id = String(id);
    }

    const resp = await fetch(url, {
      cache: 'no-store',
      method,
      body: JSON.stringify(payload),
      headers: {
        apikey,
        'Content-Type': 'application/json',
        'Client-Agent': clientHeader()
      }
    });

    if (resp.ok) {
      await sleep(250);
      await fetchSharedKeys();
      NiceModal.remove('modal');
      toastController({
        message: 'Shared API key created!'
      });
    }
  };

  const handleDeleteKey = async (key: string | boolean) => {
    try {
      const resp = await fetch(`https://aihorde.net/api/v2/sharedkeys/${key}`, {
        cache: 'no-store',
        method: 'DELETE',
        headers: {
          apikey: AppSettings.apikey(),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      });

      const details = await resp.json();

      if (details.message === 'OK') {
        await sleep(500);
        await fetchSharedKeys();
        toastController({
          message: 'Shared API key deleted!'
        });
        NiceModal.remove('delete');
      }
    } catch (err) {
      // ignore me
    }
  };

  useEffect(() => {
    fetchSharedKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (sharedKey) return null;

  return (
    <Section anchor="shared-api-key" title="Manage Shared API Keys">
      <div className="col gap-2">
        <div>
          Create special API keys that can be shared with your friends or an
          online community. Anyone using a shared key will receive your queue
          priority, potentially allowing for quicker (or more computationally
          expensive) image generations.
        </div>
        <div className="text-sm">
          Shared key data is cached on the AI Horde backend and it may take up
          to 5 minutes for changes to appear.
        </div>
        <div>
          <Button
            onClick={() =>
              NiceModal.show('modal', {
                children: (
                  <AddEditSharedKey onCreateClick={handleCreateSharedKey} />
                )
              })
            }
          >
            <IconPlus /> Create new key
          </Button>
        </div>
        {sharedKeys.length > 0 && (
          <div
            className="w-full"
            style={{
              borderTop: '1px solid white'
            }}
          />
        )}
        {sharedKeys.length > 0 &&
          sharedKeys.map((sharedKey) => (
            <>
              <div
                key={sharedKey.id}
                className="row w-full items-start justify-start gap-6"
              >
                <div className="pt-1 flex flex-row gap-1">
                  <Button
                    onClick={async () => {
                      NiceModal.show('delete', {
                        children: (
                          <DeleteConfirmation
                            deleteButtonTitle="Delete"
                            title="Remove shared key?"
                            message={
                              <>
                                <p>
                                  Are you sure you want to delete this shared
                                  API key?
                                </p>
                                <p>This cannot be undone.</p>
                              </>
                            }
                            onDelete={async () => {
                              await handleDeleteKey(sharedKey.id);
                            }}
                          />
                        )
                      });
                    }}
                    theme="danger"
                    style={{
                      height: '32px',
                      width: '32px'
                    }}
                  >
                    <IconTrash />
                  </Button>
                  <Button
                    onClick={() =>
                      NiceModal.show('modal', {
                        children: (
                          <AddEditSharedKey
                            onCreateClick={handleCreateSharedKey}
                            sharedKey={sharedKey}
                          />
                        )
                      })
                    }
                    style={{
                      height: '32px',
                      width: '32px'
                    }}
                  >
                    <IconEdit />
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(sharedKey.id);
                      toastController({
                        message: 'Shared API key copied to clipboard!'
                      });
                    }}
                    style={{
                      height: '32px',
                      width: '32px'
                    }}
                  >
                    <IconCopy />
                  </Button>
                  {/* <Button
                  style={{
                    height: '32px',
                    width: '32px'
                  }}
                >
                  <IconLink />
                </Button> */}
                </div>
                <div className="col gap-0 font-mono">
                  <div className="font-bold !text-md row gap-2 items-center">
                    <div
                      className="primary-color cursor-pointer"
                      onClick={() => {
                        const url = getBaseUrl() + `?api_key=${sharedKey.id}`;
                        navigator.clipboard.writeText(url);
                        toastController({
                          message: 'Shared key URL copied to clipboard!'
                        });
                      }}
                    >
                      <IconLink size={20} />
                    </div>
                    {sharedKey.name}
                  </div>
                  <div className="text-sm">API key: {sharedKey.id}</div>
                  <div className="text-sm">
                    Kudos remaining: {sharedKey.kudos}
                  </div>
                </div>
              </div>
            </>
          ))}
      </div>
    </Section>
  );
}
