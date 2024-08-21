import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import Apikey from './_component/Apikey'
import WorkerList from './_component/WorkerList'
import SharedKeys from './_component/SharedKeys'

export const metadata: Metadata = {
  title: 'Settings | ArtBot for Stable Diffusion'
}

export default async function SettingsPage() {
  return (
    <div className="col gap-2">
      <PageTitle>Settings</PageTitle>
      <div className="col gap-4">
        <Apikey />
        <SharedKeys />
        <WorkerList type="allow" />
        <WorkerList type="block" />
      </div>
    </div>
  )
}
