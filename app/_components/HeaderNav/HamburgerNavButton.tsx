/* eslint-disable @next/next/no-img-element */
'use client'
import useLockedBody from '@/app/_hooks/useLockedBody'
import { appBasepath } from '@/app/_utils/browserUtils'
import {
  IconCamera,
  IconHelp,
  IconHourglass,
  IconInfoCircle,
  IconMenuDeep,
  IconNotes,
  IconPhoto,
  IconPointFilled,
  IconQuestionMark,
  IconSettings,
  IconX
} from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HamburgerNavButton() {
  const [, setLocked] = useLockedBody(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        setLocked(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [setLocked])

  const handleOpenMenu = () => {
    setLocked(true)
    setOpen(true)
  }

  const handleCloseMenu = () => {
    setLocked(false)
    setOpen(false)
  }

  const MenuOptionCss = `row font-bold text-md tracking-wide cursor-pointer hover:primary-color`
  const MenuSubOptionsCss = `col pl-4 w-full mb-2`
  const MenuSubOptionCss = `row text-sm cursor-pointer hover:primary-color`

  return (
    <div className="inline-flex relative items-center">
      <button
        className="cursor-pointer text-black dark:text-white hover:primary-color select-none"
        onClick={handleOpenMenu}
      >
        <IconMenuDeep size={28} stroke={2} />
      </button>
      {open && (
        <div
          onClick={handleCloseMenu}
          id="SlidingOverlay"
          className="fixed top-0 right-0 bg-transparent w-0 h-full overflow-x-hidden z-10"
          style={{
            width: open ? '100%' : '0'
          }}
        />
      )}

      <div
        className={`top-0 w-[300px] bg-[#484848]  text-white fixed h-full z-40 ease-in-out duration-300 pb-4 ${
          open ? 'translate-x-0 left-0' : 'left-[-900px] translate-x-full'
        }`}
      >
        <div className="col w-full items-start">
          <div className="row w-full justify-between p-2">
            <div onClick={handleCloseMenu}>
              <img
                src={`${appBasepath()}/artbot-logo.png`}
                height={30}
                width={30}
                alt="AI ArtBot logo"
                className="min-w-[30px] max-w-[30px]"
              />
            </div>
            <button
              onClick={handleCloseMenu}
              className="cursor-pointer hover:primary-color select-none"
              tabIndex={open ? 0 : -1}
            >
              <IconX size={28} stroke={2} />
            </button>
          </div>
          <div
            className="col gap-3 pl-3 max-h-screen overflow-y-auto w-full pb-[156px] md:pb-[72px]"
            id="menu-links-list"
          >
            <Link
              className={MenuOptionCss}
              href="/create"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconCamera stroke={1.5} />
              Create
            </Link>
            <Link
              className={MenuOptionCss}
              href="/pending"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconHourglass stroke={1.5} />
              Pending
            </Link>
            <Link
              className={MenuOptionCss}
              href="/images"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconPhoto stroke={1.5} />
              Images
            </Link>
            <Link
              className={MenuOptionCss}
              href="/info"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconInfoCircle stroke={1.5} />
              Info
            </Link>
            <ul className={MenuSubOptionsCss}>
              <Link
                className={MenuSubOptionCss}
                href="/info/models"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                Model Details
              </Link>
              <Link
                className={MenuSubOptionCss}
                href="/info/models/updates"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                Model Updates
              </Link>
              <Link
                className={MenuSubOptionCss}
                href="/info/models?show=favorite-models"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                Favorite Models
              </Link>
              <Link
                className={MenuSubOptionCss}
                href="/info/workers"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                Worker details
              </Link>
            </ul>
            <Link
              className={MenuOptionCss}
              href="/faq"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconQuestionMark stroke={1.5} />
              FAQ
            </Link>
            <Link
              className={MenuOptionCss}
              href="/changelog"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconNotes stroke={1.5} />
              Changelog
            </Link>
            <Link
              className={MenuOptionCss}
              href="/settings"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconSettings stroke={1.5} />
              Settings
            </Link>
            <ul className={MenuSubOptionsCss}>
              <Link
                className={MenuSubOptionCss}
                href="/settings"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                AI Horde Settings
              </Link>
              <Link
                className={MenuSubOptionCss}
                href="/settings?panel=workers"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                Manage Workers
              </Link>
              <Link
                className={MenuSubOptionCss}
                href="/settings?panel=prefs"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                ArtBot Prefs
              </Link>
              <Link
                className={MenuSubOptionCss}
                href="/settings?panel=import-export"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                Import / Export
              </Link>
            </ul>
            <Link
              className={MenuOptionCss}
              href="/terms"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconHelp stroke={1.5} />
              Terms of Use
            </Link>
            <Link
              className={MenuOptionCss}
              href="/privacy"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconHelp stroke={1.5} />
              Privacy Policy
            </Link>
            <Link
              className={MenuOptionCss}
              href="/about"
              onClick={handleCloseMenu}
              tabIndex={open ? 0 : -1}
            >
              <IconHelp stroke={1.5} />
              About
            </Link>
            {/* <ul className={MenuSubOptionsCss}>
              <Link
                className={MenuSubOptionCss}
                href="/contact"
                onClick={handleCloseMenu}
                tabIndex={open ? 0 : -1}
              >
                <IconPointFilled size={12} stroke={1.5} />
                Contact
              </Link>
            </ul> */}
          </div>
        </div>
      </div>
    </div>
  )
}
