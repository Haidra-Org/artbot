import { AppConstants } from '@/app/_data-models/AppConstants';
import { AppSettings } from '@/app/_data-models/AppSettings';
import { clientHeader } from '@/app/_data-models/ClientHeader';
import { updateHordeMessages } from '@/app/_stores/UserStore';
import { WorkerMessage } from '@/app/_types/HordeTypes';

export const getWorkerMessages = async () => {
  try {
    const response = await fetch(
      `${AppConstants.AI_HORDE_PROD_URL}/api/v2/workers/messages`,
      {
        headers: {
          apikey: AppSettings.get('apiKey'),
          'Content-Type': 'application/json',
          'Client-Agent': clientHeader()
        }
      }
    );

    const data: WorkerMessage[] = await response.json();
    updateHordeMessages(data);
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
};
