import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'

export const metadata: Metadata = {
  title: 'Create | ArtBot for Stable Diffusion'
}

export default async function CreatePage() {
  return (
    <div>
      <PageTitle>Create</PageTitle>
      Placeholder for Create
    </div>
  )
}
