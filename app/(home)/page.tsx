import { IconCircleArrowRight, IconExternalLink } from '@tabler/icons-react';
import Link from 'next/link';
import NoiseToImage from '../_components/FrontPage/NoiseToImage';
import { appBasepath } from '../_utils/browserUtils';

const imageArray = [
  {
    url: `${appBasepath()}/front-page/himalays.png`,
    title: 'Himalayan mountains, flat design, vibrant colors, Moebius',
    model: 'Deliberate'
  },
  {
    url: `${appBasepath()}/front-page/astronaut.png`,
    title: 'An astronaut resting on Mars in a beach chair.',
    model: 'AlbedoBase XL (SDXL)'
  },
  {
    url: `${appBasepath()}/front-page/chalet.png`,
    title:
      'Mountain chalet covered in snow, foggy, sunrise, sharp details, sharp focus, elegant, highly detailed, illustration, by Jordan Grimmer and Greg Rutkowski',
    model: 'AlbedoBase XL (SDXL)'
  },
  {
    url: `${appBasepath()}/front-page/raven.png`,
    title:
      'Graffiti-style picture of a Raven, alcohol markers and aerosol paint',
    model: 'AlbedoBase XL (SDXL)'
  },
  {
    url: `${appBasepath()}/front-page/brisket.jpg`,
    title:
      'macro photograph of a brisket on a table with beer, in a blurred restaurant with depth of field, bokeh, soft diffused light, professional food photography',
    model: 'stable diffusion'
  },
  {
    url: `${appBasepath()}/front-page/chipmunk.png`,
    title: 'Beautiful portrait oil painting of an aristocrat chipmunk',
    model: 'AlbedoBase XL (SDXL)'
  },
  {
    url: `${appBasepath()}/front-page/sf.png`,
    title:
      'San Francisco Downtown, sunset, flat design poster, minimalist, modern, 4k, epic composition, flat vector art illustration, stunning realism, long shot, unreal engine 4d',
    model: 'AlbedoBase XL (SDXL)'
  },
  {
    url: `${appBasepath()}/front-page/penguin_surfing.png`,
    title:
      'Cartoon animation style a cool penguin wearing sunglasses, surfing on a wave. The penguin has a playful expression, standing confidently on a surfboard, with one flipper raised in a thumbs-up gesture. The wave is a vibrant blue with white frothy details, curling dynamically around the penguin. The background includes a sunny sky with a few fluffy clouds. The overall style is bright, colorful, and cheerful, typical of classic Disney animation.',
    model: 'AlbedoBase XL (SDXL)'
  },
  {
    url: `${appBasepath()}/front-page/mech_brain.png`,
    title:
      'Plans for a mechanical brain, drawn in the style of Leonardo Da Vinci',
    model: 'AlbedoBase XL (SDXL)'
  },
  {
    url: `${appBasepath()}/front-page/artbot_poster.png`,
    title: 'Movie poster that says "ARTBOT!" in the style of a 1980s comedy',
    model: 'Stable Cascade'
  }
];

export default function Home() {
  // Randomize imageArray order:
  imageArray.sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-col p-2 md:p-16 gap-8 items-center text-center">
      <h1 className="leading-[64px] text-[64px] md:text-[128px] md:leading-[128px]">
        Welcome to <span className="primary-color font-bold">ArtBot!</span>
      </h1>
      <div className="col gap-4 max-w-[800px] w-full">
        <div className="text-[20px] text-center">
          ArtBot is your gateway to experiment with the wonderful world of
          generative AI art using the power of the{' '}
          <span className="inline-flex gap-1 text-nowrap">
            <strong>AI Horde</strong>
            <div className="pt-[2px]">
              <Link
                className="primary-color"
                href="https://aihorde.net"
                target="_blank"
              >
                <IconExternalLink
                  size={20}
                  style={{ position: 'relative', top: '2px' }}
                />
              </Link>
            </div>
          </span>
          , a distributed open source network of GPUs running{' '}
          <span className="font-bold text-nowrap">Stable Diffusion</span>.
        </div>
        <div className="text-[20px] w-full text-center">
          It&apos;s free to use, no registration required.{' '}
          <Link className="row gap-1 primary-color inline-flex" href="/create">
            Get started! <IconCircleArrowRight size={20} />
          </Link>
        </div>
        <NoiseToImage images={imageArray} />
      </div>
    </div>
  );
}
