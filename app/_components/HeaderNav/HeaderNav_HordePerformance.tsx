import NiceModal from '@ebay/nice-modal-react';
import { IconDeviceDesktopAnalytics } from '@tabler/icons-react';
import HordePerformanceModal from '../Modals/Modal_HordePerformance';
import HeaderNav_IconWrapper from './_HeaderNav_IconWrapper';

export default function HeaderNavHordePerformance() {
  return (
    <HeaderNav_IconWrapper
      onClick={() => {
        NiceModal.show('hordePerfModal', {
          children: <HordePerformanceModal />
        });
      }}
    >
      <IconDeviceDesktopAnalytics stroke={1} size={22} />
    </HeaderNav_IconWrapper>
  );
}
