import clsx from 'clsx'
import { ReactNode } from 'react'

export default function OptionLabel({
  anchor,
  children,
  className,
  title,
  minWidth = '100px'
}: {
  anchor?: string
  children: ReactNode
  className?: string
  minWidth?: string
  title: ReactNode
}) {
  return (
    <label
      className={clsx('col md:row justify-between gap-2', className)}
      id={anchor}
    >
      <span style={{ minWidth }}>{title}</span>
      {children}
    </label>
  )
}
