import clsx from 'clsx'
import { ReactNode } from 'react'

export default function Section({
  children,
  className,
  title
}: {
  className?: string
  children: ReactNode
  title?: string
}) {
  return (
    <div
      className={clsx('col px-2 py-3 rounded-md bg-zinc-700 gap-2', className)}
    >
      {title && <h2 className="row font-bold">{title}</h2>}
      {children}
    </div>
  )
}
