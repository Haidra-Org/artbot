import { Menu, MenuButton, MenuDirection } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'

export default function DropdownMenu(props: {
  children: React.ReactNode
  menuButton: React.ReactNode
  direction?: MenuDirection
  shift?: number
}) {
  const { children, menuButton, ...rest } = props
  return (
    <Menu
      arrow
      menuButton={<MenuButton>{menuButton}</MenuButton>}
      transition
      {...rest}
    >
      {children}
    </Menu>
  )
}
