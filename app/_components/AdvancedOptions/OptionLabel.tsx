import clsx from 'clsx'
import { ReactNode } from 'react'

export default function OptionLabel({
  children,
  className,
  title,
  minWidth = '100px'
}: {
  children: ReactNode
  className?: string
  minWidth?: string
  title: ReactNode
}) {
  return (
    <label className={clsx('col md:row justify-between gap-2', className)}>
      <span style={{ minWidth }}>{title}</span>
      {children}
    </label>
  )
}
