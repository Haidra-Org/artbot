import { ArtBotHordeJob } from '../_data-models/ArtBotHordeJob';
import { Embedding } from '../_data-models/Civitai';
import PromptInput from '../_data-models/PromptInput';

export type AppSettingsTableKeys =
  | 'favoriteModels'
  | 'googleAuth'
  | 'imageSize'
  | 'readMessagesIds'
  | 'userInput'
  | 'webhookUrls';

export type AppSettingsTable = {
  id?: number;
  key: AppSettingsTableKeys;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
};

// Simplified CivitAi types that ArtBot will use to cast API requests to the proper type
export type CivitAiBaseModels = 'SDXL' | 'Pony' | 'SD 1.x' | 'SD 2.x' | 'NSFW' | 'Flux' | 'NoobAI' | 'Illustrious';

export type CivitAiEnhancementType = 'LORA' | 'LoCon' | 'TextualInversion';

export interface CivitAiSearchParams {
  input?: string;
  page?: number;
  limit?: number;
  type: CivitAiEnhancementType;
  signal?: AbortSignal;
  url?: string;
}

export interface FavoriteImage {
  artbot_id: string;
  image_id: string;
  favorited: boolean;
}

export interface ImagesForGallery extends ArtBotHordeJob {
  image_id: string;
  width: number;
  height: number;
  image_count: number;
}

export type ImageEnhancementModulesModifier = 'lora' | 'ti';

export interface ImageEnhancementModulesTable {
  model_id: string; // Indexed. Format: civitai_lora_[modelId] e.g., "civitai_lora_12345"
  timestamp: number;
  modifier: ImageEnhancementModulesModifier;
  type: 'favorite' | 'recent';
  model: Embedding;
}

export type ImageErrors =
  | 'csam'
  | 'default'
  | 'notfound'
  | 'nsfw'
  | 'specific'
  | 'other';

export interface ImageError {
  type: ImageErrors;
  field?: string;
  message: string;
}

export interface ImageMetaData {
  Comment?: string;
  Software?: string;
}

export type ImageOrientations =
  | 'landscape_16x9'
  | 'landscape_3x2'
  | 'portrait_2x3'
  | 'phone_bg_9x21'
  | 'ultrawide_21x9'
  | 'square'
  | 'custom';

export interface ImageRequest extends PromptInput {
  artbot_id: string;
}

export enum JobStatus {
  Waiting = 'waiting', // waiting to submit to stable horde api
  Requested = 'requested', // Job sent to API, waiting for response.
  Queued = 'queued', // submitted and waiting
  Processing = 'processing', // image has been sent to a worker and is in-process
  Done = 'done', // finished
  Error = 'error' // something unfortunate has happened
}

export enum JobType {
  ControlNet = 'controlnet',
  Img2Img = 'img2img',
  Inpainting = 'inpainting',
  Outpainting = 'outpainting',
  Remix = 'remix',
  Text2Img = 'text2img',
  Upscaling = 'upscaling'
}

export interface PromptsHistory {
  id?: number;
  artbot_id: string;
  hash_id: string;
  timestamp: number;
  favorited: number; // true === 1, false === 0
  promptType: 'prompt' | 'negative'; // indexed
  prompt: string;
  promptWords: string[]; // indexed
}

export interface PromptsJobMap {
  artbot_id: string;
  prompt_id: number;
}

/**
 * Worker added to user's list of allowed or blocked workers
 */
export interface SelectedUserWorker {
  label: string;
  timestamp: string;
  value: string;
}

export interface Workflow {
  type: 'qr_code' | '';
  position: WorkflowPosition;
  text: string;
}

export type WorkflowPosition =
  | 'center'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right';

export interface WebhookUrl {
  id: string;
  name: string;
  url: string;
  timestamp: string;
}
