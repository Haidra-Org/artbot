import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

import '../globals.css';
import { appBasepath } from '../_utils/browserUtils';
import ModalProvider from '../_providers/ModalProvider';
import AppInit from '../_components/AppInit';
import HeaderNav from '../_components/HeaderNav';
import ContentWrapper from '../_components/ContentWrapper';
import NotificationsManager from '../_components/NotificationBanners/NotificationsManager';
import Footer from '../_components/Footer';
import MobileFooter from '../_components/MobileFooter';

const APP_NAME = 'ArtBot';
const APP_DEFAULT_TITLE = 'ArtBot for Stable Diffusion';
const APP_TITLE_TEMPLATE = '%s | ArtBot';
const APP_DESCRIPTION =
  'Generate AI-created images and photos for free, with ArtBot, using an open source distributed computing cluster of Stable Diffusion GPUs powered by volunteers and the AI Horde. No login required and free to use.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  manifest: `${appBasepath()}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col justify-center" id="__app">
        <ModalProvider>
          <Toaster />
          <AppInit />
          <div
            className="flex flex-col flex-1"
            style={{
              padding: '42px 0 0 0'
            }}
          >
            <HeaderNav />
            <main
              className="flex flex-col gap-2 w-full flex-1"
              style={{ padding: '8px' }}
            >
              <ContentWrapper>
                <NotificationsManager />
                {children}
              </ContentWrapper>
            </main>
            <Footer />
            <MobileFooter />
          </div>
        </ModalProvider>
      </body>
    </html>
  );
}
