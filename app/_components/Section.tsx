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
        'row rounded-md bg-zinc-400 dark:bg-zinc-700 gap-1 relative',
        className
      )}
    >
      {anchor && (
        <a
          className=""
          style={{
            backgroundColor: 'gray',
            borderTopLeftRadius: '0.375rem',
            borderBottomLeftRadius: '0.375rem',
            position: 'absolute',
            top: 0,
            bottom: 0,
            height: '100%',
            width: '8px'
          }}
          href={`#${anchor}`}
        ></a>
      )}
      <div
        className={clsx(
          'col px-2 py-2 gap-2 w-full',
          anchor ? 'pl-3 pr-2' : ''
        )}
      >
        {title && <h2 className="row font-bold text-white">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
