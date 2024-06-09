import { ReactNode } from 'react'

export default function Section({
  children,
  title
}: {
  children: ReactNode
  title?: string
}) {
  return (
    <div className="col px-2 py-3 rounded-md bg-zinc-700 gap-2">
      {title && <h2 className="row font-bold">{title}</h2>}
      {children}
    </div>
  )
}
