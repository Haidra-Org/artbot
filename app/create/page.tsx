import { Metadata } from 'next'
import PageTitle from '../_components/PageTitle'
import { PromptInputProvider } from '../_providers/PromptInputProvider'
import PromptInputForm from './_component/PromptInputForm'
import PromptActionPanel from './_component/PromptActionPanel'
import PendingImagesPanel from '../_components/PendingImagesPanel'
import AdvancedOptions from '../_components/AdvancedOptions'
import PromptStickyCreate from './_component/PromptStickyCreate'

export const metadata: Metadata = {
  title: 'Create | ArtBot for Stable Diffusion'
}

// TODO: Figure out why I need to overiride Tailwind functions using "!".

export default async function CreatePage() {
  return (
    <PromptInputProvider>
      <div className="col md:row justify-start !items-start !gap-4">
        <div className="sm:min-w-[448px] w-full md:max-w-[512px] col gap-2">
          <PageTitle>Create</PageTitle>
          <PromptInputForm />
          <PromptActionPanel />
          <AdvancedOptions />
        </div>
        <div
          className="hidden md:w-full md:flex md:sticky md:top-[42px]"
          style={{
            minHeight: 'calc(100vh - 56px)'
          }}
        >
          <div className="col w-full">
            <PromptStickyCreate />
            <PendingImagesPanel />
          </div>
        </div>
      </div>
    </PromptInputProvider>
  )
}
