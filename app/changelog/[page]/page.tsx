import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import PageTitle from '@/app/_components/PageTitle'
import ChangelogEntry from './_component/ChangelogEntry'
import Linker from '@/app/_components/Linker'

const ITEMS_PER_PAGE = 5

interface ChangelogEntry {
  content: string
  date: string
}

export async function generateStaticParams() {
  const changelogDirectory = path.join(process.cwd(), 'app/changelog/_updates')
  const fileNames = fs
    .readdirSync(changelogDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
  const totalPages = Math.ceil(fileNames.length / ITEMS_PER_PAGE)

  return Array.from({ length: totalPages }, (_, i) => ({
    page: (i + 1).toString()
  }))
}

export default function ChangelogPage({
  params
}: {
  params: { page: string }
}) {
  const page = parseInt(params.page, 10)
  const changelogDirectory = path.join(process.cwd(), 'app/changelog/_updates')
  const fileNames = fs
    .readdirSync(changelogDirectory)
    .filter((fileName) => fileName.endsWith('.md'))

  const entries: ChangelogEntry[] = fileNames
    .map((fileName) => {
      const fullPath = path.join(changelogDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { content } = matter(fileContents)
      return {
        content,
        date: fileName.replace('.md', '')
      }
    })
    .sort((a, b) => {
      // Parse the date strings into Date objects
      const dateA = new Date(a.date.replace(/\./g, '-'))
      const dateB = new Date(b.date.replace(/\./g, '-'))
      // Sort in descending order (most recent first)
      return dateB.getTime() - dateA.getTime()
    })

  const totalPages = Math.ceil(entries.length / ITEMS_PER_PAGE)
  const paginatedEntries = entries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  return (
    <div className="col gap-2">
      <PageTitle>Changelog</PageTitle>
      <div className="changelog">
        {paginatedEntries.map((entry, index) => (
          <ChangelogEntry key={index} content={entry.content} />
        ))}
      </div>
      <div className="pagination row gap-2">
        <span>{`Page ${page} of ${totalPages}`}</span>
        {totalPages > 1 && <div>{' | '}</div>}
        {page > 1 && <Linker href={`/changelog/${page - 1}`}>Previous</Linker>}
        {page < totalPages && (
          <Linker href={`/changelog/${page + 1}`}>Next</Linker>
        )}
      </div>
    </div>
  )
}
