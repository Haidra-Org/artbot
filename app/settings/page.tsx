import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import Apikey from './_component/Apikey'

export const metadata: Metadata = {
  title: 'Settings | ArtBot for Stable Diffusion'
}

export default async function SettingsPage() {
  return (
    <div className="max-w-[800px]">
      <PageTitle>Settings</PageTitle>
      <Apikey />
    </div>
  )
}
