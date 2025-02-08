import { HordeApiParams, ImageParamsForHordeApi } from '../_data-models/ImageParamsForHordeApi';
import type PromptInput from '../_data-models/PromptInput';
import { ImageDetails } from '../_components/ImageView/ImageViewProvider';
import { GenMetadata } from '../_types/HordeTypes';

interface AdditionalDetails extends HordeApiParams {
  gen_metadata: GenMetadata[];
  modelDetails: {
    baseline: string
    version: string
  };
}

/**
 * Creates a JSON Blob from the given ImageRequest.
 */
export const createJsonAttachmentFromImageDetails = async (imageId: string, imageData: ImageDetails): Promise<Blob> => {
  const { imageFiles } = imageData;
  const imageFileDetails = imageFiles.filter(
    (file) => file.image_id === imageId
  );

  const { imageRequest } = imageData;
  const rawPayload = await ImageParamsForHordeApi.build(imageRequest)
  const { apiParams, imageDetails }: { apiParams: HordeApiParams, imageDetails: PromptInput } = rawPayload;

  const additionalDetails: AdditionalDetails = {
    ...apiParams,
    modelDetails: imageDetails.modelDetails,
    gen_metadata: imageFileDetails[0].gen_metadata || []
  };

  additionalDetails.params.seed = imageFileDetails[0].seed;

  const prettyJson = JSON.stringify(additionalDetails, null, 2);
  return new Blob([prettyJson], { type: 'application/json' });
};