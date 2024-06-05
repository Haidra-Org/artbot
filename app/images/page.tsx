import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import Gallery from '../_components/Gallery'

export const metadata: Metadata = {
  title: 'Images | ArtBot for Stable Diffusion'
}

export default async function ImagesPage() {
  return (
    <div>
      <PageTitle>Images</PageTitle>
      <Gallery />
    </div>
  )
}
