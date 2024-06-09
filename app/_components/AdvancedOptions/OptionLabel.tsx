import { ReactNode } from 'react'

export default function OptionLabel({
  children,
  title,
  minWidth = '100px'
}: {
  children: ReactNode
  minWidth?: string
  title: ReactNode
}) {
  return (
    <label className="col md:row justify-between gap-0">
      <span style={{ minWidth }}>{title}</span>
      {children}
    </label>
  )
}
