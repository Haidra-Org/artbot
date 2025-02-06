import {
  HordeApiParams,
  ImageParamsForHordeApi
} from '@/app/_data-models/ImageParamsForHordeApi';
import {
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconSettings
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import PromptInput from '../_data-models/PromptInput';
import LoraDetails from './AdvancedOptions/LoRAs/LoraDetails';
import NiceModal from '@ebay/nice-modal-react';
import { toastController } from '../_controllers/toastController';
import { JobDetails } from '../_hooks/useImageDetails';
import { ImageFileInterface } from '../_data-models/ImageFile_Dexie';
import { JobStatus } from '../_types/ArtbotTypes';
import DropdownMenu from './DropdownMenu';
import { MenuButton, MenuItem } from '@szhsin/react-menu';
import { formatJobStatus } from '../_utils/hordeUtils';
import { calculateTimeDifference } from '../_utils/numberUtils';
import type { ImageDetails as IImageDetails } from './ImageView/ImageViewProvider';

export default function ImageDetails({
  imageDetails
}: {
  imageDetails: JobDetails;
}) {
  const [display, setDisplay] = useState<
    'info' | 'job' | 'job-response' | 'request' | 'image-response'
  >('info');
  const [rawParams, setRawParams] = useState<{
    apiParams: HordeApiParams;
    imageDetails: PromptInput | IImageDetails;
  }>();

  const {
    jobDetails,
    imageFile = {} as ImageFileInterface,
    imageRequest
  } = imageDetails || ({} as JobDetails);

  useEffect(() => {
    async function fetchParams() {
      if (!imageFile || !imageRequest) return;

      const raw = await ImageParamsForHordeApi.build(
        {
          ...imageRequest,
          seed: (imageFile.seed as string) || imageRequest.seed
        } as PromptInput,
        {
          hideBase64String: true
        }
      );

      delete raw.apiParams.workers;
      delete raw.apiParams.worker_blacklist;

      setRawParams(raw);
    }

    fetchParams();
  }, [imageFile, imageRequest]);

  if (!imageDetails || !jobDetails) return null;

  const handleCopy = async () => {
    const prettyJson = JSON.stringify(rawParams?.apiParams, null, 2);

    if (!navigator.clipboard) {
      toastController({
        message:
          'Unable to copy image parameters to clipboard. JSON output to browser console.',
        type: 'error'
      });

      return;
    }

    try {
      await navigator.clipboard.writeText(prettyJson);
      toastController({
        message: 'Image request parameters copied to clipboard',
        type: 'success'
      });
    } catch (err) {
      console.log(`Err. Unable to copy text to clipboard`, err);
    }
  };

  let sectionTitle = 'Image details';

  if (display === 'job') {
    sectionTitle = 'Job details';
  }

  if (display === 'request') {
    sectionTitle = 'Request parameters';
  }

  if (display === 'image-response' || display === 'job-response') {
    sectionTitle = 'API response';
  }

  return (
    <div className="col gap-2 w-full">
      <div className="row gap-2 text-sm font-bold">
        <IconSettings stroke={1} />
        <DropdownMenu
          menuButton={({ open }) => (
            <MenuButton>
              <div className="row gap-2">
                {sectionTitle}
                {open ? <IconChevronDown /> : <IconChevronRight />}
              </div>
            </MenuButton>
          )}
        >
          <MenuItem className="font-normal" onClick={() => setDisplay('info')}>
            Image details
          </MenuItem>
          <MenuItem className="font-normal" onClick={() => setDisplay('job')}>
            Job details
          </MenuItem>
          <MenuItem
            className="font-normal"
            onClick={() => setDisplay('request')}
          >
            Request parameters
          </MenuItem>
          {jobDetails.status === JobStatus.Done && (
            <MenuItem
              className="font-normal"
              onClick={() => setDisplay('image-response')}
            >
              API response for image
            </MenuItem>
          )}
          <MenuItem
            className="font-normal"
            onClick={() => setDisplay('job-response')}
          >
            API response for job
          </MenuItem>
        </DropdownMenu>
      </div>
      {display === 'job' && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <div>
            <strong>Status: </strong>
            {formatJobStatus(jobDetails.status)}
          </div>
          <div className="mt-4">
            <strong>Created: </strong>
            {new Date(jobDetails.created_timestamp).toLocaleString()}
          </div>
          <div>
            <strong>
              {jobDetails.status === JobStatus.Done ? 'Completed' : 'Updated'}:{' '}
            </strong>
            {new Date(jobDetails.updated_timestamp).toLocaleString()}
          </div>
          {jobDetails.status === JobStatus.Done && (
            <div>
              <strong>Duration: </strong>
              {calculateTimeDifference({
                timestamp1: jobDetails.updated_timestamp,
                timestamp2: jobDetails.created_timestamp,
                unit: 'seconds'
              })}{' '}
              seconds
            </div>
          )}
          <div className="mt-4">
            <strong>Images requested: </strong>
            {jobDetails.images_requested}
          </div>
          <div>
            <strong>Images completed: </strong>
            {jobDetails.images_completed}
          </div>
          <div>
            <strong>Images failed: </strong>
            {jobDetails.images_failed}
          </div>
          {jobDetails?.errors && jobDetails?.errors.length > 0 && (
            <div className="mt-4">
              <strong>Errors: </strong>
              {jobDetails?.errors.length > 0 && (
                <div>
                  {jobDetails?.errors.map(
                    ({ message }: { message: string }, idx: number) => (
                      <div key={idx} className={`image_error_${idx} text-xs`}>
                        - {message}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {jobDetails.horde_id && (
            <div className="mt-4">
              <strong>Horde Job ID: </strong>
              <div>{jobDetails.horde_id}</div>
            </div>
          )}
        </div>
      )}
      {display === 'info' && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <div>
            <strong>Created: </strong>
            {new Date(jobDetails.created_timestamp).toLocaleString()}
          </div>
          <div className="mt-4">
            <strong>Model: </strong>
            {imageFile.model || imageRequest.models[0]}
          </div>
          <div>
            <strong>Model version: </strong>
            {imageRequest?.modelDetails?.version ?? 'N/A'}
          </div>
          <div>
            <strong>Baseline: </strong>
            {imageRequest?.modelDetails?.baseline ?? 'N/A'}
          </div>
          <div>
            <strong>Sampler: </strong>
            {imageRequest?.sampler}
          </div>
          {imageFile.kudos && (
            <div>
              <strong>Kudos: </strong>
              {imageFile.kudos}
            </div>
          )}
          {imageRequest.preset.length > 0 && (
            <div className="mt-4">
              <strong>Preset: </strong>
              {imageRequest.preset[0].name}
            </div>
          )}
          <div className="mt-4">
            <strong>Steps: </strong>
            {imageRequest.steps}
          </div>
          <div>
            <strong>Guidance (CFG scale): </strong>
            {imageRequest.cfg_scale}
          </div>
          {(imageFile.seed || imageRequest.seed) && (
            <div>
              <strong>Seed: </strong>
              {imageFile.seed || imageRequest.seed}
            </div>
          )}
          <div className="mt-4">
            <div>
              <strong>Height: </strong>
              {imageRequest.height}px
            </div>
            <div>
              <strong>Width: </strong>
              {imageRequest.width}px
            </div>
          </div>
          {imageRequest?.loras?.length > 0 && (
            <div className="mt-4">
              <div className="mb-1">[ LoRAs ]</div>
              {imageRequest.loras.map((lora) => {
                return (
                  <div
                    key={lora.name}
                    style={{
                      borderLeft: '2px solid #aabad4',
                      marginLeft: '4px',
                      paddingLeft: '8px'
                    }}
                  >
                    <div
                      className="row"
                      onClick={() => {
                        if (lora.isArtbotManualEntry) return;

                        NiceModal.show('embeddingDetails', {
                          children: <LoraDetails details={lora} />
                        });
                      }}
                    >
                      <strong>LoRA: </strong>
                      {!lora.isArtbotManualEntry ? (
                        <div className="cursor-pointer primary-color">
                          {lora.name}
                        </div>
                      ) : (
                        <div>{lora.name}</div>
                      )}
                    </div>
                    <div className="row">
                      <strong>LoRA version: {lora.versionName}</strong>
                    </div>
                    <div className="row">
                      <strong>Strength: </strong>
                      {lora.strength}
                    </div>
                    <div className="row">
                      <strong>CLIP: </strong>
                      {lora.clip}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {imageRequest?.workflows?.length > 0 && (
            <div className="mt-4">
              <div className="mb-1">[ Workflows ]</div>
              {imageRequest.workflows.map((workflow, idx) => {
                return (
                  <div
                    key={`${workflow.type}_${idx}`}
                    style={{
                      borderLeft: '2px solid #aabad4',
                      marginLeft: '4px',
                      paddingLeft: '8px'
                    }}
                  >
                    <div className="row">
                      <strong>Type: {workflow.type}</strong>
                    </div>
                    <div className="row">
                      <strong>Text: {workflow.text}</strong>
                    </div>
                    <div className="row">
                      <strong>Position: {workflow.position}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4">
            <strong>Karras: </strong>
            {imageRequest.karras ? 'true' : 'false'}
          </div>
          <div>
            <strong>Hi-res fix: </strong>
            {imageRequest.hires ? 'true' : 'false'}
          </div>
          <div>
            <strong>CLIP skip: </strong>
            {imageRequest.clipskip}
          </div>
          <div>
            <strong>Tiled: </strong>
            {imageRequest.tiling ? 'true' : 'false'}
          </div>
          {imageRequest.transparent && (
            <div>
              <strong>Transparent background: </strong>
              {imageRequest.transparent ? 'true' : 'false'}
            </div>
          )}

          {imageFile?.gen_metadata && imageFile?.gen_metadata?.length > 0 && (
            <div className="mt-4">
              <div className="mb-1">[ Generation Metadata ]</div>
              {imageFile.gen_metadata.map((gen, idx) => {
                return (
                  <div
                    key={`${gen}_${imageFile.image_id}_${idx}`}
                    style={{
                      borderLeft: '2px solid #aabad4',
                      marginLeft: '4px',
                      paddingLeft: '8px'
                    }}
                  >
                    <div className="row">
                      <strong>Type: {gen.type}</strong>
                    </div>
                    <div className="row">
                      <strong>Ref: {gen.ref}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="col gap-1 mt-4">
            {imageFile.worker_name && (
              <div>
                <strong>Worker name: </strong>
                <div>{imageFile.worker_name}</div>
              </div>
            )}
            {imageFile.worker_id && (
              <div>
                <strong>Worker ID: </strong>
                <div>{imageFile.worker_id}</div>
              </div>
            )}
            {jobDetails.horde_id && (
              <div>
                <strong>Horde Job ID: </strong>
                <div>{jobDetails.horde_id}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {display === 'request' && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(rawParams?.apiParams, null, 2)}
          </pre>
        </div>
      )}
      {display === 'image-response' && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <pre
            className="whitespace-pre-wrap"
            style={{
              overflowWrap: 'break-word'
            }}
          >
            {JSON.stringify(JSON.parse(imageFile.apiResponse), null, 2)}
          </pre>
        </div>
      )}
      {display === 'job-response' && jobDetails.api_response && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <pre
            className="whitespace-pre-wrap"
            style={{
              overflowWrap: 'break-word'
            }}
          >
            {JSON.stringify(jobDetails.api_response, null, 2)}
          </pre>
        </div>
      )}
      {display === 'job-response' && !jobDetails.api_response && (
        <div className="bg-[#1E293B] text-white font-mono p-2 w-full text-[14px] col gap-0">
          <pre
            className="whitespace-pre-wrap"
            style={{
              overflowWrap: 'break-word'
            }}
          >
            Waiting for API response from AI Horde.
          </pre>
        </div>
      )}
      <button
        className="cursor-pointer row text-[14px]"
        tabIndex={0}
        onClick={handleCopy}
      >
        <IconCopy stroke={1.5} />
        Copy JSON request parameters
      </button>
    </div>
  );
}
