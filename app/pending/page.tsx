import PageTitle from '../_components/PageTitle'
import PendingImagesPanel from '../_components/PendingImagesPanel'

export default function PendingPage() {
  return (
    <div className="col">
      <PageTitle>Pending Images</PageTitle>
      <PendingImagesPanel showBorder={false} />
    </div>
  )
}
