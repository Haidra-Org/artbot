import React from 'react'
import { Menu, MenuButton, MenuProps } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'

type MenuButtonRenderProp = (
  modifiers: Readonly<{ open: boolean }>
) => React.ReactElement

interface DropdownMenuProps extends Omit<MenuProps, 'menuButton'> {
  children: React.ReactNode
  menuButton: React.ReactNode | MenuButtonRenderProp
}

export default function DropdownMenu(props: DropdownMenuProps) {
  const { children, menuButton, ...rest } = props

  const renderMenuButton = (modifiers: Readonly<{ open: boolean }>) => {
    if (typeof menuButton === 'function') {
      return menuButton(modifiers)
    }
    return <MenuButton>{menuButton}</MenuButton>
  }

  return (
    <Menu arrow menuButton={renderMenuButton} transition {...rest}>
      {children}
    </Menu>
  )
}
