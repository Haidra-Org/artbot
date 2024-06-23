import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

import HeaderNav from './_components/HeaderNav'
import './globals.css'
import ModalProvider from './_providers/ModalProvider'
import ContentWrapper from './_components/ContentWrapper'
import BetaWarningPanel from './_components/BetaWarningPanel'
import MobileFooter from './_components/MobileFooter'
import AppInit from './_components/AppInit'

export const metadata: Metadata = {
  title: 'ArtBot for Stable Diffusion',
  description:
    'Generate AI-created images and photos with Stable Diffusion using an open source distributed computing cluster powered by the AI Horde. No login required and free to use.'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col justify-center min-h-screen" id="__app">
        <ModalProvider>
          <Toaster />
          <AppInit />
          <div
            className="flex flex-col flex-1"
            style={{
              padding: '42px 8px 8px 8px',
              paddingBottom: 'var(--footer-padding)'
            }}
          >
            <HeaderNav />
            <main className="flex flex-col gap-2 w-full flex-1 sm:p-1">
              <ContentWrapper>
                <BetaWarningPanel />
                {children}
              </ContentWrapper>
            </main>
            <MobileFooter />
          </div>
        </ModalProvider>
      </body>
    </html>
  )
}
