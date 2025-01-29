'use client';

/* eslint-disable @next/next/no-img-element */
import Linker from '../../_components/Linker';
import PageTitle from '../../_components/PageTitle';
import { appBasepath } from '../../_utils/browserUtils';

export default function AboutPage() {
  return (
    <div className="col gap-x-20">
      <PageTitle>About ArtBot</PageTitle>
      <div className="max-w-[1000px]">
        <img
          src={`${appBasepath()}/painting_bot.png`}
          alt="painting of a confused robot"
          style={{
            borderRadius: '8px',
            boxShadow: `0 16px 38px -12px rgba(0, 0, 0, 0.56), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2)`,
            marginBottom: '16px',
            width: '100%'
          }}
        />
      </div>
      <div className="col gap-2">
        <div>
          ArtBot is a front-end web client designed for interacting with the{' '}
          <Linker href="https://aihorde.net">AI Horde</Linker> distributed
          cluster.
        </div>
        <div>
          The AI Horde is an open source platform that utilizes idle GPU power
          provided by a community of generous users that allows anyone to create
          generative AI artwork on their own computers or mobile devices. More
          information is available on the Stable Horde page and you can also
          join their Discord server for further discussion on the technology
          behind the cluster, as well as tools built on top of the platform
          (such as ArtBot).
        </div>
        <div>
          ArtBot was initially built as a way to experiment with various
          client-side technology, such as IndexedDB and LocalStorage APIs. These
          APIs allow you to securely and privately store the AI generated images
          you&apos;ve created with the cluster within your own browser. The UI
          components are built using NextJS. The source code is available on{' '}
          <Linker href="https://github.com/Haidra-Org/artbot">Github</Linker>.
        </div>
      </div>
    </div>
  );
}
