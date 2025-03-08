import { checkPendingJobs } from './checkPendingJobs';
import * as PendingImagesStore from '@/app/_stores/PendingImagesStore';
import checkImage, { CheckSuccessResponse } from '@/app/_api/horde/check';
import * as UpdateModule from './updatePendingImage';

jest.mock('@/app/_stores/PendingImagesStore');
jest.mock('@/app/_api/horde/check');
jest.mock('./downloadPendingImages');
jest.mock('./updatePendingImage');
jest.mock('@/app/_db/dexie', () => ({
  db: {
    transaction: jest.fn((fn: Function) => fn())
  }
}));

jest.useFakeTimers();

describe('checkPendingJobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks and timers if needed.
    jest.setSystemTime(Date.now());
  });

  it('should return "no_jobs" when there are no pending jobs', async () => {
    (PendingImagesStore.getPendingImagesByStatusFromAppState as jest.Mock).mockReturnValue([]);
    const result = await checkPendingJobs();
    expect(result).toBe('no_jobs');
  });

  it('should process a pending job and return "processing" when job is ongoing', async () => {
    const dummyJob = {
      artbot_id: 'job1',
      horde_id: 'h1',
      images_requested: 1,
      images_failed: 0
    };
    (PendingImagesStore.getPendingImagesByStatusFromAppState as jest.Mock).mockReturnValue([dummyJob]);
    
    const successResponse: CheckSuccessResponse = {
      success: true,
      finished: 0,
      done: false,
      processing: 1,
      queue_position: 5,
      wait_time: 1000,
      kudos: 0,
      faulted: false,
      is_possible: true,
      restarted: 0,
      waiting: 0
    };
    // simulate checkImage returning a successful response that is still processing (not finished)
    (checkImage as jest.Mock).mockResolvedValue(successResponse);
    
    const result = await checkPendingJobs();
    expect(result).toBe('processing');
    // Ensure updatePendingImage was called to update job status for an ongoing job.
    expect(UpdateModule.updatePendingImage).toHaveBeenCalled();
  });

  it('should log an error when checkImage is rejected and return "processing"', async () => {
    const dummyJob = {
      artbot_id: 'job1',
      horde_id: 'h1',
      images_requested: 1,
      images_failed: 0
    };
    (PendingImagesStore.getPendingImagesByStatusFromAppState as jest.Mock).mockReturnValue([dummyJob]);
    
    const errorObj = new Error("Network failure");
    (checkImage as jest.Mock).mockRejectedValue(errorObj);
    
    console.error = jest.fn();
    
    const result = await checkPendingJobs();
    expect(result).toBe('processing');
    expect(console.error).toHaveBeenCalledWith(
      `Error checking image with ID h1:`,
      errorObj
    );
  });
});
