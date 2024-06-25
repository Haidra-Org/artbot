import styles from './masonry.module.css'

export default function MasonryItem({
  children
}: {
  children: React.ReactNode
}) {
  return <div className={styles['masonry-item']}>{children}</div>
}
