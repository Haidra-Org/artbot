import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import { PromptInputProvider } from '../_providers/PromptInputProvider'

export const metadata: Metadata = {
  title: 'Create | ArtBot for Stable Diffusion'
}

export default async function CreatePage() {
  return (
    <PromptInputProvider>
      <PageTitle>Create</PageTitle>
      Placeholder for Create
    </PromptInputProvider>
  )
}
