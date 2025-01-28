/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import HamburgerNavButton from './HamburgerNavButton';
import UserKudos from './HeaderNav_UserKudos';
import HeaderNavPendingJobs from './HeaderNav_PendingJobs';
import HeaderNavUserWarning from './HeaderNav_UserWarning';
import { appBasepath } from '@/app/_utils/browserUtils';
import HeaderNavHordePerformance from './HeaderNav_HordePerformance';
import HeaderNav_HordeOffline from './HeaderNav_HordeOffline';
import HeaderNav_Messages from './HeaderNav_Messages';

export default function HeaderNav() {
  const LinkStyles =
    'normal-case px-[12px] font-bold text-black dark:text-white text-xs hover:primary-color';

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full row text-white h-[42px] justify-between items-center"
      style={{ backgroundColor: `var(--background-color)` }}
    >
      <div className="row gap-1 pl-2">
        <HamburgerNavButton />
        <Link href="/">
          <div className="row items-center p-2 text-white h-[42px]">
            <img
              src={`${appBasepath()}/artbot-logo.png`}
              height={30}
              width={30}
              alt="AI ArtBot logo"
              className="min-w-[30px] max-w-[30px]"
            />
            <div className="font-[700] text-[20px] primary-color">
              ArtBot{' '}
              <sup
                className="hidden md:inline"
                style={{ fontSize: '10px', fontWeight: '700', top: '-8px' }}
              >
                v2
              </sup>
            </div>
          </div>
        </Link>
      </div>
      <div className="row pr-2">
        <div className="row hidden sm:flex">
          <Link className={LinkStyles} href="/create">
            Create
          </Link>
          <Link className={LinkStyles} href="/images">
            Images
          </Link>
          <Link className={LinkStyles} href="/info">
            Info
          </Link>
          <Link className={LinkStyles} href="/settings">
            Settings
          </Link>
        </div>
        <div className="row gap-4">
          <HeaderNavPendingJobs />
          <HeaderNavUserWarning />
          <HeaderNavHordePerformance />
          <UserKudos />
          <HeaderNav_Messages />
          <HeaderNav_HordeOffline />
        </div>
      </div>
    </header>
  );
}
