import styles from './masonry.module.css'

export default function MasonryLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <div className={styles['masonry-with-columns']}>{children}</div>
}
