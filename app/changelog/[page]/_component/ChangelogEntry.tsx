// app/changelog/_components/ChangelogEntry.tsx
'use client'

import ReactMarkdown from 'react-markdown'
import Linker from '@/app/_components/Linker'

interface ChangelogEntryProps {
  content: string
}

export default function ChangelogEntry({ content }: ChangelogEntryProps) {
  return (
    <div className="changelog-entry mb-4">
      <ReactMarkdown
        components={{
          h1: (props) => <h2 className="font-bold mb-1" {...props} />,
          ul: (props) => <ul className="list-disc text-sm" {...props} />,
          // @ts-expect-error blah!
          a: (props) => <Linker className="underline" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
