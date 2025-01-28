import { UserStore } from '@/app/_stores/UserStore';
import { IconMail } from '@tabler/icons-react';
import { useStore } from 'statery';

export default function HeaderNav_Messages() {
  const { hordeMessages } = useStore(UserStore);

  if (hordeMessages.length === 0) {
    return null;
  }

  return (
    <button
      className="row text-xs py-[4px] px-[6px] rounded-md"
      // onClick={() => {
      //   NiceModal.show('modal', {
      //     children: <HordeOfflineModal />
      //   });
      // }}
    >
      <IconMail stroke={1.5} size={24} />
    </button>
  );
}
