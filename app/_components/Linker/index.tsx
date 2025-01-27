'use client';

import Link from 'next/link';
import { CSSProperties } from 'react';
import clsx from 'clsx';
import styles from './linker.module.css';

interface LinkerProps {
  children?: React.ReactNode;
  disableLinkClick?: boolean;
  inline?: boolean;
  onClick?: () => void;
  href: string;
  rel?: string;
  target?: string;
  inverted?: boolean;
}

const Linker = (props: LinkerProps) => {
  const {
    children,
    disableLinkClick = false,
    inline,
    onClick = () => {},
    inverted = false,
    ...rest
  } = props;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Handle scenario where we want to have a link available for middle click / open new tab,
    // but we want the normal left click event to do something else.
    if (disableLinkClick) {
      e.preventDefault();
      e.stopPropagation();
    }

    onClick();
  };

  const style: CSSProperties = {};

  if (inline) {
    style.display = 'inline-block';
  }

  let target = '';

  if (
    props.href &&
    props.href.indexOf('https://') === 0 &&
    props.href.indexOf('https://tinybots.net') !== 0
  ) {
    target = '_blank';
  }

  return (
    <Link
      className={clsx(styles.Linker, inverted && styles.inverted)}
      target={target}
      {...rest}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        ...style
      }}
    >
      {children}
    </Link>
  );
};

export default Linker;
