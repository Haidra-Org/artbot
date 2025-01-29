import { Metadata } from 'next';
import PageTitle from '../../_components/PageTitle';

export const metadata: Metadata = {
  title: 'Terms and Conditions | ArtBot for Stable Diffusion'
};

async function getData() {
  const res = await fetch('https://aihorde.net/api/v2/documents/terms');
  const data = res.json();

  return data;
}

export default async function TermsPage() {
  const data = await getData();

  data.html = data.html.replace('<h1>Terms and Conditions</h1>\n', '');
  data.html = data.html.replace(/<h1>/g, '<h1 class="font-bold text-lg">');
  data.html = data.html.replace(
    /<h2>/g,
    '<h2 class="font-bold text-md italic">'
  );
  data.html = data.html.replace(/<h3>/g, '<h3 class="text-md italic">');

  return (
    <div>
      <PageTitle>Terms and Conditions</PageTitle>
      <div
        className="col gap-4"
        dangerouslySetInnerHTML={{ __html: data.html }}
      ></div>
    </div>
  );
}
