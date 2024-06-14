import {
  IconAlertTriangle,
  IconExclamationCircle,
  IconTriangle
} from '@tabler/icons-react'
import { PromptError } from '../_hooks/usePromptInputValidation'
import Button from './Button'
import NiceModal from '@ebay/nice-modal-react'

interface PromptWarningProps {
  errors: PromptError[]
}

export default function PromptWarning({ errors }: PromptWarningProps) {
  return (
    <div className="col w-full h-full">
      <h2 className="row font-bold">Warnings</h2>
      <div className="col w-full gap-4 flex-wrap">
        {errors.map((error) => (
          <div
            key={`error-${error.message}`}
            className="col gap-2 px-2 py-1 rounded"
            style={{
              borderLeft: `4px solid ${error.type === 'critical' ? 'red' : 'orange'}`
            }}
          >
            <div className="row gap-2">
              {error.type === 'warning' && <IconExclamationCircle />}
              {error.type === 'critical' && (
                <IconAlertTriangle className="text-red-500" />
              )}
              {error.message}
            </div>
            {error.type === 'warning' && (
              <div className="font-bold text-sm">
                (Optional) You can still continue.
              </div>
            )}
            {error.type === 'critical' && (
              <div className="font-bold text-sm">
                (Required) You must fix this error in order to continue.
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="w-full row justify-end">
        <Button
          onClick={() => {
            NiceModal.remove('modal')
          }}
        >
          Close
        </Button>
      </div>
    </div>
  )
}
