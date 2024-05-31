import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'

export const metadata: Metadata = {
  title: 'Privacy Policy | ArtBot for Stable Diffusion'
}

export default async function PrivacyPage() {
  return (
    <div>
      <PageTitle>Privacy Policy</PageTitle>
      Placeholder for Privacy Policy
    </div>
  )
}
