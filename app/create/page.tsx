import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import { PromptInputProvider } from '../_providers/PromptInputProvider'
import PromptInputForm from './_component/PromptInputForm'

export const metadata: Metadata = {
  title: 'Create | ArtBot for Stable Diffusion'
}

export default async function CreatePage() {
  return (
    <PromptInputProvider>
      <PageTitle>Create</PageTitle>
      <div className="w-full max-w-[576px]">
        <PromptInputForm />
      </div>
    </PromptInputProvider>
  )
}
