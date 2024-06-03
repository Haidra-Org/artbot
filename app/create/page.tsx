import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import { PromptInputProvider } from '../_providers/PromptInputProvider'
import PromptInputForm from './_component/PromptInputForm'
import PromptActionPanel from './_component/PromptActionPanel'
import PendingImagesPanel from '../_components/PendingImagesPanel'

export const metadata: Metadata = {
  title: 'Create | ArtBot for Stable Diffusion'
}

// TODO: Figure out why I need to overiride Tailwind functions using "!".

export default async function CreatePage() {
  return (
    <PromptInputProvider>
      <PageTitle>Create</PageTitle>
      <div className="col md:row justify-start !items-start !gap-4">
        <div className="w-full max-w-[576px] col gap-2">
          <PromptInputForm />
          <PromptActionPanel />
        </div>
        <div className="w-full">
          <PendingImagesPanel />
        </div>
      </div>
    </PromptInputProvider>
  )
}
