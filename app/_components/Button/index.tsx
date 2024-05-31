'use client'

import clsx from 'clsx'
import React, { CSSProperties, ReactNode } from 'react'
import styles from './button.module.css'

// Extend this as needed
type ButtonTheme = 'default' | 'danger' | 'warning'

const Button = React.forwardRef(
  (
    {
      className,
      children,
      disabled = false,
      onClick = () => {},
      outline = false,
      style,
      title,
      theme = 'default',
      type = 'button'
    }: {
      className?: string
      children: ReactNode
      disabled?: boolean
      onClick: () => void
      outline?: boolean
      style?: CSSProperties
      title?: string
      type?: 'button' | 'submit'
      theme?: ButtonTheme
    },
    ref
  ) => {
    return (
      <button
        // @ts-expect-error TODO
        ref={ref}
        className={clsx(
          styles.Button,
          styles[theme],
          { [styles.outline]: outline },
          disabled && styles.disabled,
          className
        )}
        onClick={() => {
          if (disabled) return
          onClick()
        }}
        style={{ ...style }}
        title={title}
        type={type}
      >
        <span className={styles.ButtonText}>{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
