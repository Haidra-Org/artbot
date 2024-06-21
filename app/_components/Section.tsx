import clsx from 'clsx'
import { ReactNode } from 'react'

export default function Section({
  anchor,
  children,
  className,
  title
}: {
  anchor?: string
  className?: string
  children: ReactNode
  title?: string
}) {
  return (
    <div
      id={anchor}
      className={clsx(
        'col px-2 py-3 rounded-md bg-zinc-400 dark:bg-zinc-700 gap-2',
        className
      )}
    >
      {title && <h2 className="row font-bold text-white">{title}</h2>}
      {children}
    </div>
  )
}
