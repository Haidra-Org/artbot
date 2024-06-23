import {
  CloseButton,
  Popover,
  PopoverButton,
  PopoverPanel
} from '@headlessui/react'
import { IconCheck, IconFilter } from '@tabler/icons-react'
import Button from '../Button'
import { useState } from 'react'

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
    <Popover className="relative">
      <PopoverButton as="div">
        <Button onClick={() => {}} style={{ height: '38px', width: '38px' }}>
          <IconFilter />
        </Button>
      </PopoverButton>
      <PopoverPanel
        anchor="bottom"
        className="col bg-white dark:bg-black p-2 rounded-md w-[180px] mt-2"
        transition
        style={{
          border: '1px solid white'
        }}
      >
        <div className="text-sm font-bold">Filter images:</div>
        <CloseButton
          className="row w-full"
          onClick={() => {
            handleFilterClick('all')
          }}
        >
          <div className="w-[20px] pr-1">
            {filterState === 'all' && <IconCheck size={12} />}
          </div>
          All
        </CloseButton>
        <CloseButton
          className="row w-full"
          onClick={() => {
            handleFilterClick('done')
          }}
        >
          <div className="w-[20px] pr-1">
            {filterState === 'done' && <IconCheck size={12} />}
          </div>
          Done
        </CloseButton>
        <CloseButton
          className="row w-full"
          onClick={() => {
            handleFilterClick('processing')
          }}
        >
          <div className="w-[20px] pr-1">
            {filterState === 'processing' && <IconCheck size={12} />}
          </div>
          Processing
        </CloseButton>
        <CloseButton
          className="row w-full"
          onClick={() => {
            handleFilterClick('pending')
          }}
        >
          <div className="w-[20px] pr-1">
            {filterState === 'pending' && <IconCheck size={12} />}
          </div>
          Pending
        </CloseButton>
        <CloseButton
          className="row w-full"
          onClick={() => {
            handleFilterClick('error')
          }}
        >
          <div className="w-[20px] pr-1">
            {filterState === 'error' && <IconCheck size={12} />}
          </div>
          Error
        </CloseButton>
      </PopoverPanel>
    </Popover>
  )
}
