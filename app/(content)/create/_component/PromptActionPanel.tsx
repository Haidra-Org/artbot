'use client';

import { useStore } from 'statery';
import Button from '@/app/_components/Button';
import DeleteConfirmation from '@/app/_components/Modal_DeleteConfirmation';
import PromptWarning from '@/app/_components/PromptWarning';
import PromptInput from '@/app/_data-models/PromptInput';
import { deleteImageFileByArtbotIdTx } from '@/app/_db/ImageFiles';
import { useInput } from '@/app/_providers/PromptInputProvider';
import NiceModal from '@ebay/nice-modal-react';
import {
  IconDevicesPc,
  IconHourglass,
  IconInfoTriangle,
  IconLock,
  IconSquarePlus,
  IconTrash
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import useCreateImageRequest from '../_hook/useCreateImageRequest';
import clsx from 'clsx';
import { AppConstants } from '@/app/_data-models/AppConstants';
import ForceWorkerModal from '@/app/(content)/create/_component/ForceWorkerModal';
import { UserStore } from '@/app/_stores/UserStore';

export interface PromptActionPanelProps {
  height?: number;
  isSticky?: boolean;
}

export default function PromptActionPanel({
  height = 36,
  isSticky = false
}: PromptActionPanelProps) {
  const { forceSelectedWorker } = useStore(UserStore);
  const { input, kudos, setInput, setSourceImages } = useInput();
  const { prompt, negative } = input;
  const {
    emptyInput,
    errors,
    handleCreateClick,
    hasCriticalError,
    requestPending
  } = useCreateImageRequest();
  const router = useRouter();
  const totalPromptLength = prompt.trim().length + negative.trim().length;

  return (
    <>
      <div className={clsx('row w-full', !isSticky && 'justify-between')}>
        {!isSticky && (
          <div className="text-xs font-mono hidden md:block">
            ({totalPromptLength.toLocaleString()} chars)
            <br />
            {kudos > 0 ? <span>({kudos} kudos)</span> : <span>&nbsp;</span>}
          </div>
        )}
        {!isSticky && <div className="md:hidden">&nbsp;</div>}
        <div className={clsx('row', isSticky && 'w-full')}>
          <Button
            theme="danger"
            aria-label="Reset all settings"
            onClick={async () => {
              NiceModal.show('delete', {
                children: (
                  <DeleteConfirmation
                    deleteButtonTitle="Reset"
                    title="Reset prompt?"
                    message={
                      <>
                        <p>
                          Are you sure you want to reset all image generation
                          settings to their default values?
                        </p>
                        <p>This cannot be undone.</p>
                      </>
                    }
                    onDelete={async () => {
                      setInput({ ...new PromptInput() });
                      await deleteImageFileByArtbotIdTx(
                        AppConstants.IMAGE_UPLOAD_TEMP_ID
                      );
                      setSourceImages([]);
                      window.scrollTo(0, 0);

                      // Strip hash off URL if it exists.
                      router.push('/create');

                      // For now, just close modal on delete
                      NiceModal.remove('modal');
                    }}
                  />
                )
              });
            }}
            style={{
              height: `${height}px`,
              width: isSticky ? '25%' : `88px`
            }}
          >
            <span className="row gap-1">
              <IconTrash stroke={1.5} />
              Reset?
            </span>
          </Button>
          <Button
            disabled={emptyInput || requestPending || hasCriticalError}
            onClick={handleCreateClick}
            aria-label={
              hasCriticalError
                ? 'Please fix errors before creating'
                : 'Create new image'
            }
            title={
              hasCriticalError
                ? 'Please fix errors before creating'
                : 'Send image request to the AI Horde'
            }
            style={{
              height: `${height}px`,
              width: isSticky ? '75%' : `88px`
            }}
          >
            <span className="row gap-1">
              {requestPending ? (
                <>
                  <IconHourglass />
                  Sending...
                </>
              ) : (
                <>
                  <IconSquarePlus stroke={1.5} />
                  Create
                  {isSticky && kudos > 0 ? <span>({kudos} kudos)</span> : ''}
                </>
              )}
            </span>
          </Button>
          {errors.length > 0 && (
            <Button
              theme="warning"
              aria-label="Show warnings"
              onClick={() => {
                NiceModal.show('modal', {
                  children: <PromptWarning errors={errors} />
                });
              }}
              style={{
                height: `${height}px`
              }}
            >
              <span className="row gap-1">
                <IconInfoTriangle stroke={1.5} />
              </span>
            </Button>
          )}
          <Button
            aria-label={forceSelectedWorker ? 'Worker locked' : 'Select worker'}
            onClick={() => {
              NiceModal.show('modal', {
                children: <ForceWorkerModal />,
                modalClassName: 'max-w-[640px]'
              });
            }}
            style={{
              backgroundColor: forceSelectedWorker
                ? 'orange'
                : 'rgb(106, 183, 198)',
              borderColor: forceSelectedWorker
                ? 'orange'
                : 'rgb(106, 183, 198)',
              height: `${height}px`,
              width: `40px`
            }}
          >
            {forceSelectedWorker ? (
              <IconLock stroke={1.5} />
            ) : (
              <IconDevicesPc stroke={1.5} />
            )}
          </Button>
        </div>
      </div>
      {!isSticky && (
        <div className="row justify-between mb-[-10px]">
          <div>&nbsp;</div>
          <div className="block md:hidden">
            <div className="row text-xs font-mono text-right">
              ({totalPromptLength.toLocaleString()} chars)
              {kudos > 0 && (
                <span>
                  {' | '}({kudos} kudos)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
