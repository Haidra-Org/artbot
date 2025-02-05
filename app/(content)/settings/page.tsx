import { Metadata } from 'next';
import PageTitle from '../../_components/PageTitle';
import Apikey from './_component/Apikey';
import WorkerList from './_component/WorkerList';
import SharedKeys from './_component/SharedKeys';
import SectionTitle from '../../_components/SectionTitle';
import Section from '../../_components/Section';
import Linker from '../../_components/Linker';
import WebhookUrls from './_component/WebhookUrls';
import GoogleAuth from './_component/GoogleAuth';

export const metadata: Metadata = {
  title: 'Settings | ArtBot for Stable Diffusion'
};

export default async function SettingsPage() {
  return (
    <div className="col gap-2">
      <PageTitle>Settings</PageTitle>
      <div className="col gap-4">
        <div className="col gap-2">
          <SectionTitle anchor="api-keys">API Keys</SectionTitle>
          <Apikey />
          <SharedKeys />
        </div>
        <div className="col gap-2">
          <SectionTitle anchor="workers">Workers</SectionTitle>
          <WorkerList type="allow" />
          <WorkerList type="block" />
          <Section title="Manage your workers">
            <div>
              Visit the{' '}
              <Linker href="/settings/workers" inverted>
                worker management page
              </Linker>{' '}
              to manage your workers.
            </div>
          </Section>
        </div>
        <div className="col gap-2">
          <SectionTitle anchor="connections">Connections</SectionTitle>
          <WebhookUrls />
          <GoogleAuth />
        </div>
      </div>
    </div>
  );
}
