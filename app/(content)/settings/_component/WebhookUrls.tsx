'use client';
import { useCallback, useEffect, useState } from 'react';

import Section from '@/app/_components/Section';
import {
  getWebhookUrlsFromDexie,
  saveWebhookUrlsToDexie
} from '@/app/_db/appSettings';
import { IconPlus, IconX } from '@tabler/icons-react';
import { toastController } from '@/app/_controllers/toastController';
import Button from '@/app/_components/Button';
import { WebhookUrl } from '@/app/_types/ArtbotTypes';
import NiceModal from '@ebay/nice-modal-react';
import AddEditWebhook from './AddEditWebhook';
import DeleteConfirmation from '@/app/_components/Modal_DeleteConfirmation';
import { nanoid } from 'nanoid';
import { AppConstants } from '@/app/_data-models/AppConstants';

export default function WebhookUrls() {
  const [webhookUrls, setWebhookUrls] = useState<WebhookUrl[]>([]);

  useEffect(() => {
    const fetchWebhookUrls = async () => {
      const webhookUrls = await getWebhookUrlsFromDexie();
      setWebhookUrls(webhookUrls);
    };
    fetchWebhookUrls();
  }, []);

  const handleAddWebhookUrl = useCallback(
    ({ name, url }: { name: string; url: string }) => {
      if (!name.trim()) {
        toastController({
          message: 'Webhook name cannot be empty',
          type: 'error'
        });
        return;
      }

      if (!url.trim()) {
        toastController({
          message: 'Webhook URL cannot be empty',
          type: 'error'
        });
        return;
      }

      // check if formatted as a valid url
      try {
        new URL(url);
      } catch (error) {
        toastController({
          message: 'Invalid URL',
          type: 'error'
        });
        return;
      }

      if (url.trim()) {
        const newWebhookUrls = [
          ...webhookUrls,
          {
            id: nanoid(AppConstants.NANO_ID_LENGTH),
            name,
            url,
            timestamp: new Date().toLocaleString()
          }
        ];
        setWebhookUrls(newWebhookUrls);
        saveWebhookUrlsToDexie(newWebhookUrls);
        NiceModal.remove('modal');
      }
    },
    [webhookUrls]
  );

  const handleDeleteWebhookUrl = useCallback(
    (id: string) => {
      const newWebhookUrls = webhookUrls.filter(
        (webhookObj) => webhookObj.id !== id
      );
      setWebhookUrls(newWebhookUrls);
      saveWebhookUrlsToDexie(newWebhookUrls);
    },
    [webhookUrls]
  );

  return (
    <Section anchor="webhook-urls" title="Webhook URLs">
      <div className="col gap-2">
        <div>
          Add a webhook URL to send images to a specific URL via the share image
          button.
        </div>
        <div>
          <strong>Note:</strong> Webhook URLs are not shared with other users
          and may also be subject to rate limits by consuming service.
        </div>
        <div>
          <Button
            onClick={() => {
              NiceModal.show('modal', {
                children: (
                  <AddEditWebhook handleAddWebhookUrl={handleAddWebhookUrl} />
                )
              });
            }}
          >
            <IconPlus /> Add Webhook
          </Button>
        </div>
        {webhookUrls && Object.keys(webhookUrls).length > 0 && (
          <div className="col gap-2">
            {webhookUrls.map((webhookObj) => {
              console.log(`url`, webhookObj);
              return (
                <div
                  className="row w-full items-start justify-start gap-6"
                  key={webhookObj.url}
                >
                  <div className="pt-1 flex flex-row gap-1">
                    <Button
                      onClick={() => {
                        NiceModal.show('delete', {
                          children: (
                            <DeleteConfirmation
                              deleteButtonTitle="Delete"
                              title="Remove webhook URL?"
                              message={
                                <>
                                  <p>
                                    Are you sure you want to delete this webhook
                                    URL?
                                  </p>
                                  <p>This cannot be undone.</p>
                                </>
                              }
                              onDelete={() => {
                                handleDeleteWebhookUrl(webhookObj.id);
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
                      <IconX />
                    </Button>
                  </div>
                  <div className="col gap-0 font-mono">
                    <div className="font-bold !text-md">{webhookObj.name}</div>
                    <div className="text-sm">{webhookObj.timestamp}</div>
                    <div className="text-sm">{webhookObj.url}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Section>
  );
}
