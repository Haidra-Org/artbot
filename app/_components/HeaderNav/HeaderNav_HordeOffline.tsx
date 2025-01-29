import NiceModal from '@ebay/nice-modal-react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useStore } from 'statery';
import { AppStore } from '@/app/_stores/AppStore';
import HeaderNav_IconWrapper from './_HeaderNav_IconWrapper';

const HordeOfflineModal = () => {
  return (
    <div
      className="flex flex-col gap-2"
      style={{ maxWidth: '400px', width: '100%' }}
    >
      <div className="stats bg-body-color">
        <div className="stat">
          <div className="font-bold pb-1 flex flex-row items-center gap-2">
            <IconAlertTriangle color="red" stroke={1.5} size={24} />
            AI Horde offline
          </div>
          <div className="col gap-2">
            <div className="text-secondary">
              ArtBot has encountered an issue while attempting to contact the AI
              Horde API. It may potentially be down. Network requests could be
              affected.
            </div>
            <div className="text-secondary">Please check again soon.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HeaderNav_HordeOffline() {
  const { hordeOnline } = useStore(AppStore);

  if (hordeOnline) {
    return null;
  }

  return (
    <HeaderNav_IconWrapper
      onClick={() => {
        NiceModal.show('modal', {
          children: <HordeOfflineModal />
        });
      }}
      title="AI Horde is offline"
    >
      <IconAlertTriangle color="red" stroke={1.5} size={24} />
    </HeaderNav_IconWrapper>
  );
}
