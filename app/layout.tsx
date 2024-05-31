import type { Metadata } from 'next'
import HeaderNav from './_components/HeaderNav'
import './globals.css'
import AppInit from './AppInit'

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
        <AppInit />
        <div className="flex flex-col flex-1 pt-[42px] p-[8px]">
          <HeaderNav />
          <main className="flex flex-col gap-4 w-full flex-1 sm:p-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
