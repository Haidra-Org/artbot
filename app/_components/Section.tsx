'use client'

import { Accordion, AccordionItem } from '@szhsin/react-accordion'
import { IconChevronDown } from '@tabler/icons-react'
import clsx from 'clsx'
import { ReactNode } from 'react'

export default function Section({
  accordion,
  anchor,
  children,
  className,
  title,
  initiallyExpanded = false
}: {
  accordion?: boolean
  anchor?: string
  className?: string
  children: ReactNode
  title?: string
  initiallyExpanded?: boolean
}) {
  return (
    <div
      id={anchor}
      className={clsx(
        'row rounded-md bg-zinc-400 dark:bg-zinc-700 gap-1 relative',
        className
      )}
    >
      {anchor && (
        <a
          className=""
          style={{
            backgroundColor: 'gray',
            borderTopLeftRadius: '0.375rem',
            borderBottomLeftRadius: '0.375rem',
            position: 'absolute',
            top: 0,
            bottom: 0,
            height: '100%',
            width: '8px'
          }}
          href={`#${anchor}`}
        ></a>
      )}
      <div
        className={clsx(
          'col px-2 py-2 gap-2 w-full',
          anchor ? 'pl-5 pr-2' : ''
        )}
      >
        {accordion ? (
          <Accordion transition transitionTimeout={150}>
            <AccordionItem
              header={({ state: { isEnter } }) => (
                <h2 className="row font-bold text-white items-center">
                  <IconChevronDown
                    className={`transition-transform duration-200 ${isEnter ? 'rotate-180' : ''
                      }`}
                    size={24}
                  />
                  {title}
                </h2>
              )}
              initialEntered={initiallyExpanded} // Add this line to control initial state
              style={{
                marginBottom: '-8px'
              }}
            >
              <div className='mb-2'>
                {children}
              </div>
            </AccordionItem>
          </Accordion>
        ) : (
          <>
            {title && <h2 className="row font-bold text-white">{title}</h2>}
            {children}
          </>
        )}
      </div>
    </div>
  )
}