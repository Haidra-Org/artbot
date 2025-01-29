import { Metadata } from 'next';
import PageTitle from '../../_components/PageTitle';
import { FaqApiKey, FaqKudos } from './_component/FAQ_Kudos';

export const metadata: Metadata = {
  title: 'FAQ | ArtBot for Stable Diffusion'
};

export default function FAQPage() {
  return (
    <div>
      <PageTitle>FAQ</PageTitle>
      <div className="col gap-4">
        <div
          style={{
            border: '1px solid #7e5a6c',
            borderRadius: '4px',
            padding: '8px'
          }}
        >
          <FaqKudos />
        </div>
        <div
          style={{
            border: '1px solid #7e5a6c',
            borderRadius: '4px',
            padding: '8px'
          }}
        >
          <FaqApiKey />
        </div>
      </div>
    </div>
  );
}
