import { CSSProperties } from 'react'
import styles from './spinner.module.css'

export default function Spinner({
  style,
  size = 50
}: {
  size?: number
  style?: CSSProperties
}) {
  return (
    <svg
      viewBox={`0 0 50 50`}
      width={size}
      height={size}
      className={styles.styledSVG}
      style={style}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
        className={styles.styledCircle}
      ></circle>
    </svg>
  )
}
