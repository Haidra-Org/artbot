import NiceModal from '@ebay/nice-modal-react'
import { IconDeviceDesktopAnalytics } from '@tabler/icons-react'
import HordePerformanceModal from '../Modals/Modal_HordePerformance'

export default function HeaderNavHordePerformance() {
  return (
    <button
      className="row text-xs py-[4px] px-[6px] rounded-md hover:bg-zinc-400 dark:hover:bg-zinc-700"
      onClick={() => {
        NiceModal.show('hordePerfModal', {
          children: <HordePerformanceModal />
        })
      }}
    >
      <IconDeviceDesktopAnalytics stroke={1} size={20} />
    </button>
  )
}
