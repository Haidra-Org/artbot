import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'

export const metadata: Metadata = {
  title: 'Images | ArtBot for Stable Diffusion'
}

export default async function ImagesPage() {
  return (
    <div>
      <PageTitle>Images</PageTitle>
      Placeholder for Images
    </div>
  )
}
