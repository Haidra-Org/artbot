import NiceModal from '@ebay/nice-modal-react'
import { IconDeviceDesktopAnalytics } from '@tabler/icons-react'
import HordePerformanceModal from '../Modals/Modal_HordePerformance'

export default function HeaderNavHordePerformance() {
  return (
    <button
      className="row text-xs text-black dark:text-white"
      onClick={() => {
        NiceModal.show('hordePerfModal', {
          children: <HordePerformanceModal />
        })
      }}
    >
      <IconDeviceDesktopAnalytics stroke={1} size={22} />
    </button>
  )
}
