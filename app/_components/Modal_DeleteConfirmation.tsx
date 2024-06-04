import NiceModal from '@ebay/nice-modal-react'
import { ReactNode } from 'react'
import Button from './Button'

export default function DeleteConfirmation({
  deleteButtonTitle = 'Delete',
  message,
  onDelete,
  title = 'Delete image?'
}: {
  deleteButtonTitle?: string
  message?: ReactNode
  onDelete: () => void
  title?: string
}) {
  return (
    <div className="col gap-4">
      <h2 className="row font-bold text-[18px]">
        <svg
          className="h-6 w-6 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z"
          />
        </svg>
        {title}
      </h2>
      <div className="col gap-0">
        {message ? (
          message
        ) : (
          <>
            <p>
              Are you sure you want to <strong>delete</strong> this image?
            </p>
            <p>This action cannot be undone.</p>
          </>
        )}
      </div>
      <div className="row w-full justify-end">
        <Button onClick={() => NiceModal.remove('delete')} outline>
          Cancel
        </Button>
        <Button
          onClick={() => {
            NiceModal.remove('delete')
            onDelete()
          }}
          theme="danger"
        >
          {deleteButtonTitle}
        </Button>
      </div>
    </div>
  )
}
