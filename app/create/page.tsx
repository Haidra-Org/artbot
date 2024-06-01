import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import { PromptInputProvider } from '../_providers/PromptInputProvider'
import PromptInputForm from './_component/PromptInputForm'
import PromptActionPanel from './_component/PromptActionPanel'

export const metadata: Metadata = {
  title: 'Create | ArtBot for Stable Diffusion'
}

export default async function CreatePage() {
  return (
    <PromptInputProvider>
      <PageTitle>Create</PageTitle>
      <div className="w-full max-w-[576px] col gap-2">
        <PromptInputForm />
        <PromptActionPanel />
      </div>
    </PromptInputProvider>
  )
}
