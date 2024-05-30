import { IconCircleArrowRight, IconExternalLink } from '@tabler/icons-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col p-16 gap-8 items-center text-center">
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
      </div>
    </div>
  )
}
