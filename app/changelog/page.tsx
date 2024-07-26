import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'

export const metadata: Metadata = {
  title: 'Changelog | ArtBot for Stable Diffusion'
}

export default async function ChangelogPage() {
  return (
    <div>
      <PageTitle>Changelog</PageTitle>
      Placeholder for Changelog
    </div>
  )
}
