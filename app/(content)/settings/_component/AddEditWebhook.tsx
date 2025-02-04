import { useState } from 'react';

import Input from '@/app/_components/Input';
import Button from '@/app/_components/Button';

interface AddEditWebhookProps {
  handleAddWebhookUrl: ({ name, url }: { name: string; url: string }) => void;
}

export default function AddEditWebhook({
  handleAddWebhookUrl
}: AddEditWebhookProps) {
  const [inputName, setInputName] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  return (
    <div className="flex flex-col gap-4 px-2">
      <h2 className="font-bold">Add webhook URL</h2>
      <div>
        <label htmlFor="inputKeyName">Webhook Name:</label>
        <Input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="inputUrl">Webhook URL:</label>
        <Input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
        />
      </div>
      <Button
        onClick={() => {
          handleAddWebhookUrl({ name: inputName, url: inputUrl });
        }}
      >
        Add Webhook
      </Button>
    </div>
  );
}
