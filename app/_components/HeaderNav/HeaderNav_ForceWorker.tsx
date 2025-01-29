'use client';

import { UserStore } from '@/app/_stores/UserStore';
import ForceWorkerModal from '@/app/(content)/create/_component/ForceWorkerModal';
import NiceModal from '@ebay/nice-modal-react';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import { useStore } from 'statery';
import HeaderNav_IconWrapper from './_HeaderNav_IconWrapper';

export default function HeaderNavForceWorker() {
  const { forceSelectedWorker } = useStore(UserStore);
  if (!forceSelectedWorker) return null;

  return (
    <HeaderNav_IconWrapper
      onClick={() => {
        NiceModal.show('modal', {
          children: <ForceWorkerModal />,
          modalClassName: 'max-w-[640px]'
        });
      }}
      title="Requests locked to specific worker(s)"
    >
      <IconAlertTriangleFilled color="orange" stroke={1} size={22} />
    </HeaderNav_IconWrapper>
  );
}
