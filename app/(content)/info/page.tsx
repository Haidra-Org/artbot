import { Metadata } from 'next';
import PageTitle from '../../_components/PageTitle';

export const metadata: Metadata = {
  title: 'Info | ArtBot for Stable Diffusion'
};

export default async function InfoPage() {
  return (
    <div>
      <PageTitle>Info</PageTitle>
      Placeholder for Info Page
    </div>
  );
}
