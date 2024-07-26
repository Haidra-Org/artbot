import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'

export const metadata: Metadata = {
  title: 'FAQ | ArtBot for Stable Diffusion'
}

export default async function FAQPage() {
  return (
    <div>
      <PageTitle>FAQ</PageTitle>
      Placeholder for FAQ
    </div>
  )
}
