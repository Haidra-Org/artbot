import { Menu, MenuButton, MenuDirection } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import '@szhsin/react-menu/dist/transitions/slide.css'

export default function DropdownMenu({
  children,
  menuButton,
  direction
}: {
  children: React.ReactNode
  menuButton: React.ReactNode
  direction?: MenuDirection
}) {
  return (
    <Menu
      arrow
      menuButton={<MenuButton>{menuButton}</MenuButton>}
      direction={direction}
      transition
    >
      {children}
    </Menu>
  )
}
