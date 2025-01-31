'use client';

import clsx from 'clsx';
import { CSSProperties, ReactNode, ElementType, forwardRef } from 'react';
import styles from './button.module.css';

// Extend this as needed
type ButtonTheme = 'default' | 'danger' | 'warning' | 'success';

interface ButtonProps<T extends ElementType = 'button'> {
  as?: T;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  outline?: boolean;
  style?: CSSProperties;
  title?: string;
  type?: 'button' | 'submit';
  theme?: ButtonTheme;
}

type PolymorphicRef<C extends ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

const Button = forwardRef(
  <T extends ElementType = 'button'>(
    {
      as,
      className,
      children,
      disabled = false,
      onClick = () => {},
      outline = false,
      style,
      title,
      theme = 'default',
      type = 'button',
      ...rest
    }: ButtonProps<T>,
    ref: PolymorphicRef<T>
  ) => {
    const Component = as || 'button';

    return (
      <Component
        ref={ref}
        className={clsx(
          styles.Button,
          styles[theme],
          { [styles.outline]: outline },
          disabled && styles.disabled,
          className
        )}
        onClick={() => {
          if (disabled) return;
          onClick();
        }}
        style={{ ...style }}
        title={title}
        type={Component === 'button' ? type : undefined}
        {...rest}
      >
        <span className={styles.ButtonText}>{children}</span>
      </Component>
    );
  }
);

Button.displayName = 'Button';
export default Button;
