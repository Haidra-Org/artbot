import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import Apikey from './_component/Apikey'
import Section from '../_components/Section'
import WorkerList from './_component/WorkerList'

export const metadata: Metadata = {
  title: 'Settings | ArtBot for Stable Diffusion'
}

export default async function SettingsPage() {
  return (
    <div className="col gap-2">
      <PageTitle>Settings</PageTitle>
      <div className="col gap-4">
        <Section anchor="api-key" title="AI Horde API key (optional)">
          <Apikey />
        </Section>
        <WorkerList type="allow" />
        <WorkerList type="block" />
      </div>
    </div>
  )
}
