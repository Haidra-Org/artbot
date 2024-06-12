import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import { PromptInputProvider } from '../_providers/PromptInputProvider'
import PromptInputForm from './_component/PromptInputForm'
import PromptActionPanel from './_component/PromptActionPanel'
import PendingImagesPanel from '../_components/PendingImagesPanel'
import AdvancedOptions from '../_components/AdvancedOptions'

export const metadata: Metadata = {
  title: 'Create | ArtBot for Stable Diffusion'
}

// TODO: Figure out why I need to overiride Tailwind functions using "!".

export default async function CreatePage() {
  return (
    <PromptInputProvider>
      <PageTitle>Create</PageTitle>
      <div className="col md:row justify-start !items-start !gap-4">
        <div className="sm:min-w-[448px] w-full md:max-w-[512px] col gap-4">
          <PromptInputForm />
          <PromptActionPanel />
          <AdvancedOptions />
        </div>
        <div className="hidden md:w-full md:flex">
          <PendingImagesPanel />
        </div>
      </div>
    </PromptInputProvider>
  )
}
