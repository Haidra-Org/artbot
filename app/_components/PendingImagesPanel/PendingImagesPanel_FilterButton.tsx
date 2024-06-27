import { IconCheck, IconFilter } from '@tabler/icons-react'
import Button from '../Button'
import { useState } from 'react'
import { MenuHeader, MenuItem } from '@szhsin/react-menu'
import DropdownMenu from '../DropdownMenu'

export default function FilterButton({
  filter,
  setFilter = () => {}
}: {
  filter: string
  setFilter: (filter: string) => void
}) {
  const [filterState, setFilterState] = useState(filter)

  const handleFilterClick = (filter: string) => {
    setFilterState(filter)
    setFilter(filter)
  }

  return (
    <DropdownMenu
      menuButton={
        <Button
          as="div"
          onClick={() => {}}
          style={{ height: '38px', width: '38px' }}
        >
          <IconFilter />
        </Button>
      }
      shift={-120}
    >
      {/* <div className="text-sm font-bold">Filter images:</div> */}
      <MenuHeader>Filter images</MenuHeader>
      <MenuItem
        onClick={() => {
          handleFilterClick('all')
        }}
      >
        <div className="w-[20px] pr-1">
          {filterState === 'all' && <IconCheck size={12} />}
        </div>
        All
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleFilterClick('done')
        }}
      >
        <div className="w-[20px] pr-1">
          {filterState === 'done' && <IconCheck size={12} />}
        </div>
        Done
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleFilterClick('processing')
        }}
      >
        <div className="w-[20px] pr-1">
          {filterState === 'processing' && <IconCheck size={12} />}
        </div>
        Processing
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleFilterClick('pending')
        }}
      >
        <div className="w-[20px] pr-1">
          {filterState === 'pending' && <IconCheck size={12} />}
        </div>
        Pending
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleFilterClick('error')
        }}
      >
        <div className="w-[20px] pr-1">
          {filterState === 'error' && <IconCheck size={12} />}
        </div>
        Error
      </MenuItem>
    </DropdownMenu>
  )
}
