import { CheckSuccessResponse, CheckErrorResponse } from '../check';

const checkImage = jest.fn<Promise<CheckSuccessResponse | CheckErrorResponse>, [string]>();

export default checkImage;
export type { CheckSuccessResponse, CheckErrorResponse };