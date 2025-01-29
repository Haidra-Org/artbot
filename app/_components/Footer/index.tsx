'use client';
import Link from 'next/link';
import styles from './footer.module.css';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  IconBuildingCommunity,
  IconCamera,
  IconExternalLink,
  IconInfoCircle,
  IconMessage,
  IconPhoto,
  IconQuestionMark,
  IconRobot,
  IconTool
} from '@tabler/icons-react';
import Linker from '../Linker';
import BuildId from './buildId';
import AnimatedEmoji from './AnimatedEmoji';

export default function Footer() {
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  return (
    <div className={clsx(styles.Footer, isHomePage && styles.NoPadding)}>
      <div className={styles.SectionsWrapper}>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconCamera stroke={1} />
            Creation Tools
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/create">
              Create new image
            </Link>
          </div>
          {/* <div>
            <Link className={styles.LinkWrapper} href="/controlnet">
              ControlNet
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/draw">
              Draw
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/create?panel=img2img">
              Image-to-image
            </Link>
          </div> */}
          {/* <div>
            <Link
              className={styles.LinkWrapper}
              href="/create?panel=inpainting"
            >
              Inpainting
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/live-paint">
              Live paint
            </Link>
          </div> */}
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconPhoto stroke={1} />
            Image gallery
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/pending">
              Pending images
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/images">
              View image gallery
            </Link>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconInfoCircle stroke={1} />
            General info
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/info/models">
              Model details
            </Link>
          </div>
          {/* <div>
            <Link className={styles.LinkWrapper} href="/info/models/updates">
              Model updates
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/info/workers">
              Worker details
            </Link>
          </div> */}
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconTool stroke={1} />
            Utilities
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/settings/workers">
              Manage workers
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/user/messages">
              Messages
            </Link>
          </div>
        </div>
        {/* <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconTool stroke={1} />
            Utilities
          </div>
          <div>
            <Link
              className={styles.LinkWrapper}
              href="/settings?panel=import-export"
            >
              Export images
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/interrogate">
              Interrogate image
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/settings?panel=worker">
              Manage workers
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/rate">
              Rate images
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/profile">
              User profile
            </Link>
          </div>
        </div> */}
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconBuildingCommunity stroke={1} />
            Community
          </div>
          <Link
            href="https://aihorde.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="row gap-2">
              AI Horde <IconExternalLink size={18} stroke={1} />
            </div>
          </Link>
          {/* <div>
            <Link className={styles.LinkWrapper} href="/showcase">
              Image showcase
            </Link>
          </div> */}
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconQuestionMark stroke={1} />
            Resources
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/faq">
              FAQ
            </Link>
          </div>
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconMessage stroke={1} />
            Contact
          </div>
          <div>
            <Link
              href="https://discord.com/channels/781145214752129095/1107628882783391744"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="row gap-2">
                Discord
                <IconExternalLink size={18} stroke={1} />
              </div>
            </Link>
          </div>
          <div>
            <Link
              href="https://github.com/Haidra-Org/artbot/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="row gap-2">
                Github issues <IconExternalLink size={18} stroke={1} />
              </div>
            </Link>
          </div>
          <div>
            <Link
              href="https://mastodon.world/@davely"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="row gap-2">
                Mastodon <IconExternalLink size={18} stroke={1} />
              </div>
            </Link>
          </div>
          {/* <div>
            <Link className={styles.LinkWrapper} href="/contact">
              Send message
            </Link>
          </div> */}
        </div>
        <div className={styles.Section}>
          <div className={styles.SectionTitle}>
            <IconRobot stroke={1} />
            ArtBot
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/about">
              About
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/changelog">
              Changelog
            </Link>
          </div>
          {/* <div>
            <Link className={styles.LinkWrapper} href="/contributors">
              Contributors
            </Link>
          </div> */}
          <div>
            <Link
              href="https://github.com/Haidra-Org/artbot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="row gap-2">
                Github
                <IconExternalLink size={18} stroke={1} />
              </div>
            </Link>
          </div>
          {/* <div>
            <Link className={styles.LinkWrapper} href="/settings?panel=prefs">
              Preferences
            </Link>
          </div> */}
          <div>
            <Link className={styles.LinkWrapper} href="/terms">
              Terms of Use
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/privacy">
              Privacy policy
            </Link>
          </div>
          <div>
            <Link className={styles.LinkWrapper} href="/settings">
              Settings
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.AboutWrapper} id="ArtBot_MadeWithLove">
        <div>
          ArtBot is created with <AnimatedEmoji /> by{' '}
          <Linker
            href="https://www.threads.net/@dave.ly"
            target="_blank"
            rel="noopener noreferrer"
          >
            @davely
          </Linker>{' '}
          in California.
        </div>
      </div>
      <BuildId />
    </div>
  );
}
