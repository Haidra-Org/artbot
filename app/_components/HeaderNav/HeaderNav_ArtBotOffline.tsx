import NiceModal from '@ebay/nice-modal-react';
import HeaderNav_IconWrapper from './_HeaderNav_IconWrapper';
import { IconWifiOff } from '@tabler/icons-react';
import { useStore } from 'statery';
import { AppStore } from '@/app/_stores/AppStore';

export default function HeaderNavArtBotOffline() {
  const { online } = useStore(AppStore);

  if (online) return null;

  return (
    <HeaderNav_IconWrapper
      onClick={() => {
        NiceModal.show('modal', {
          children: (
            <div className="col">
              <h2 className="row font-bold">Connection error</h2>
              ArtBot is currently having trouble conecting to its server. You
              may encounter unexpected errors.
            </div>
          ),
          modalClassName: 'max-w-[640px]'
        });
      }}
      title="ArtBot server is currently offline."
    >
      <IconWifiOff color="orange" stroke={1.5} size={22} />
    </HeaderNav_IconWrapper>
  );
}
