'use client'
import { usePathname } from 'next/navigation'

import Link from 'next/link'
import styles from './mobileFooter.module.css'
import clsx from 'clsx'
import {
  IconEdit,
  IconHourglass,
  IconPhoto,
  IconSettings
} from '@tabler/icons-react'

export default function MobileFooter() {
  const pathname = usePathname()

  const isActive = (path = '') => {
    return path === pathname
  }

  return (
    <div className={styles['footer-wrapper']}>
      <div className={styles['nav-icons-wrapper']}>
        <Link href="/create">
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/create') && <div className={styles.NavIconActive} />}
            <IconEdit className={clsx(styles['svg'])} size={32} stroke={1} />
          </div>
        </Link>
        <Link href="/pending">
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/pending') && <div className={styles.NavIconActive} />}
            <IconHourglass
              className={clsx(styles['svg'])}
              size={32}
              stroke={1}
            />
          </div>
        </Link>
        <Link href="/images" className="relative">
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/images') && <div className={styles.NavIconActive} />}
            <IconPhoto className={clsx(styles['svg'])} size={32} stroke={1} />
          </div>
        </Link>
        <Link href="/settings">
          <div className={clsx('relative', styles['nav-icon'])}>
            {isActive('/settings') && <div className={styles.NavIconActive} />}
            <IconSettings
              className={clsx(styles['svg'])}
              size={32}
              stroke={1}
            />
          </div>
        </Link>
      </div>
    </div>
  )
}
