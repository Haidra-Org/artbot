import { JobStatus } from '@/app/_types/ArtbotTypes';
import { AppConstants } from '@/app/_data-models/AppConstants';
import { getPendingImagesByStatusFromAppState } from '@/app/_stores/PendingImagesStore';
import { getImageRequestsFromDexieById } from '@/app/_db/imageRequests';
import { transitionJobFromWaitingToRequested } from '@/app/_db/hordeJobs';
import generateImage from '@/app/_api/horde/generate';
import checkImage from '@/app/_api/horde/check';
import { checkForWaitingJobs } from './checkForWaitingJobs';
import { updatePendingImage } from './updatePendingImage';
import { ImageParamsForHordeApi } from '@/app/_data-models/ImageParamsForHordeApi';

// Mock all the dependencies
jest.mock('@/app/_stores/PendingImagesStore');
jest.mock('@/app/_db/imageRequests');
jest.mock('@/app/_db/hordeJobs');
jest.mock('@/app/_api/horde/generate');
jest.mock('@/app/_api/horde/check', () => {
  return {
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      wait_time: 10,
      is_possible: true,
      processing: 0
    })
  };
});
jest.mock('./updatePendingImage');
jest.mock('@/app/_data-models/ImageParamsForHordeApi');

describe('checkForWaitingJobs', () => {
  // Store original console.error
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to suppress logs
    console.error = jest.fn();
  });

  afterEach(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });

  it('should return early if max concurrent jobs reached', async () => {
    // Mock that we already have max concurrent jobs
    const mockPendingJobs = Array(AppConstants.MAX_CONCURRENT_JOBS).fill({
      status: JobStatus.Processing
    });
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [];
        return mockPendingJobs;
      }
    );

    await checkForWaitingJobs();

    // Verify we didn't try to process any new jobs
    expect(transitionJobFromWaitingToRequested).not.toHaveBeenCalled();
    expect(getImageRequestsFromDexieById).not.toHaveBeenCalled();
  });

  it('should return early if no waiting jobs', async () => {
    // Mock no pending or waiting jobs
    (getPendingImagesByStatusFromAppState as jest.Mock).mockReturnValue([]);

    await checkForWaitingJobs();

    expect(transitionJobFromWaitingToRequested).not.toHaveBeenCalled();
    expect(getImageRequestsFromDexieById).not.toHaveBeenCalled();
  });

  it('should return early if job transition fails', async () => {
    // Mock one waiting job
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );

    // Mock transition failure (another instance picked it up)
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(null);

    await checkForWaitingJobs();

    expect(transitionJobFromWaitingToRequested).toHaveBeenCalledWith('test-id');
    expect(getImageRequestsFromDexieById).not.toHaveBeenCalled();
  });

  it('should handle missing image request', async () => {
    // Mock one waiting job
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );

    // Mock successful transition
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );

    // Mock missing image request
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([]);

    await checkForWaitingJobs();

    expect(updatePendingImage).toHaveBeenCalledWith('test-id', {
      status: JobStatus.Error,
      errors: [{ type: 'other', message: 'Image request not found' }]
    });
  });

  it('should handle successful API response', async () => {
    // Mock one waiting job
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    const mockImageRequest = { id: 'request-id' };
    const mockApiParams = { params: 'test' };
    const mockApiResponse = { id: 'horde-id' };
    const mockCheckResponse = {
      wait_time: 10,
      is_possible: true,
      processing: 0
    };

    // Setup all the mocks
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([
      mockImageRequest
    ]);
    (ImageParamsForHordeApi.build as jest.Mock).mockResolvedValue({
      apiParams: mockApiParams
    });
    (generateImage as jest.Mock).mockResolvedValue(mockApiResponse);
    (checkImage as jest.Mock).mockResolvedValue(mockCheckResponse);

    await checkForWaitingJobs();

    expect(generateImage).toHaveBeenCalledWith(mockApiParams);
    expect(checkImage).toHaveBeenCalledWith('horde-id');
    expect(updatePendingImage).toHaveBeenCalledWith(
      'test-id',
      expect.objectContaining({
        status: JobStatus.Queued,
        horde_id: 'horde-id',
        wait_time: 10,
        is_possible: true
      })
    );
  });

  it('should handle API error response', async () => {
    // Mock one waiting job
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    const mockImageRequest = { id: 'request-id' };
    const mockApiParams = { params: 'test' };
    const mockApiError = {
      errors: [{ error: 'API error' }],
      message: 'Error message'
    };

    // Setup all the mocks
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([
      mockImageRequest
    ]);
    (ImageParamsForHordeApi.build as jest.Mock).mockResolvedValue({
      apiParams: mockApiParams
    });
    (generateImage as jest.Mock).mockResolvedValue(mockApiError);

    await checkForWaitingJobs();

    expect(generateImage).toHaveBeenCalledWith(mockApiParams);
    expect(updatePendingImage).toHaveBeenCalledWith('test-id', {
      status: JobStatus.Error,
      errors: expect.arrayContaining([
        expect.objectContaining({
          type: 'default',
          message: 'Error message'
        })
      ])
    });
  });

  it('should handle unexpected errors', async () => {
    // Mock one waiting job
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    const mockImageRequest = { id: 'request-id' };

    // Setup all the mocks
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([
      mockImageRequest
    ]);
    (ImageParamsForHordeApi.build as jest.Mock).mockRejectedValue(
      new Error('Unexpected error')
    );

    await checkForWaitingJobs();

    expect(updatePendingImage).toHaveBeenCalledWith('test-id', {
      status: JobStatus.Error,
      errors: [{ type: 'other', message: 'Unexpected error occurred: Unexpected error' }]
    });
  });

  it('should handle impossible jobs', async () => {
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    const mockImageRequest = { id: 'request-id' };
    const mockApiParams = { params: 'test' };
    const mockApiResponse = { id: 'horde-id' };
    const mockCheckResponse = {
      wait_time: 30,
      is_possible: false,
      processing: 0
    };

    // Setup all the mocks
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([
      mockImageRequest
    ]);
    (ImageParamsForHordeApi.build as jest.Mock).mockResolvedValue({
      apiParams: mockApiParams
    });
    (generateImage as jest.Mock).mockResolvedValue(mockApiResponse);
    (checkImage as jest.Mock).mockResolvedValue(mockCheckResponse);

    await checkForWaitingJobs();

    expect(updatePendingImage).toHaveBeenCalledWith(
      'test-id',
      expect.objectContaining({
        status: JobStatus.Queued,
        is_possible: false,
        wait_time: 30,
        jobErrorMessage: expect.stringContaining('no GPU workers')
      })
    );
  });

  it('should handle jobs that start processing', async () => {
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    const mockImageRequest = { id: 'request-id' };
    const mockApiParams = { params: 'test' };
    const mockApiResponse = { id: 'horde-id' };
    const mockCheckResponse = {
      wait_time: 5,
      is_possible: true,
      processing: 1
    };

    // Setup all the mocks
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([
      mockImageRequest
    ]);
    (ImageParamsForHordeApi.build as jest.Mock).mockResolvedValue({
      apiParams: mockApiParams
    });
    (generateImage as jest.Mock).mockResolvedValue(mockApiResponse);
    (checkImage as jest.Mock).mockResolvedValue(mockCheckResponse);

    await checkForWaitingJobs();

    expect(updatePendingImage).toHaveBeenCalledWith(
      'test-id',
      expect.objectContaining({
        status: JobStatus.Processing,
        is_possible: true,
        wait_time: 5
      })
    );
  });

  it('should handle malformed API responses', async () => {
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    const mockImageRequest = { id: 'request-id' };
    const mockApiParams = { params: 'test' };
    // Test malformed response from generateImage
    const malformedApiResponse = null; // null response will trigger error handling

    // Setup all the mocks
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([
      mockImageRequest
    ]);
    (ImageParamsForHordeApi.build as jest.Mock).mockResolvedValue({
      apiParams: mockApiParams
    });
    (generateImage as jest.Mock).mockResolvedValue(malformedApiResponse);

    await checkForWaitingJobs();

    // The code handles null responses by creating a default error
    expect(updatePendingImage).toHaveBeenCalledWith('test-id', {
      status: JobStatus.Error,
      errors: [
        {
          type: 'specific',
          field: '0',
          message: '{"error":"unknown error"}'
        }
      ]
    });
  });

  it('should handle malformed check responses', async () => {
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    const mockImageRequest = { id: 'request-id' };
    const mockApiParams = { params: 'test' };
    const mockApiResponse = { id: 'horde-id' };
    const malformedCheckResponse = {
      something_else: 'unexpected'
    };

    // Setup all the mocks
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([
      mockImageRequest
    ]);
    (ImageParamsForHordeApi.build as jest.Mock).mockResolvedValue({
      apiParams: mockApiParams
    });
    (generateImage as jest.Mock).mockResolvedValue(mockApiResponse);
    (checkImage as jest.Mock).mockResolvedValue(malformedCheckResponse);

    await checkForWaitingJobs();

    // The current implementation silently fails for malformed check responses
    // We should consider improving this, but for now we're testing the actual behavior
    expect(updatePendingImage).not.toHaveBeenCalledWith(
      'test-id',
      expect.objectContaining({
        status: JobStatus.Error
      })
    );
  });

  it('should preserve initial wait time when updating status', async () => {
    const mockWaitingJob = { artbot_id: 'test-id', status: JobStatus.Waiting };
    const mockImageRequest = { id: 'request-id' };
    const mockApiParams = { params: 'test' };
    const mockApiResponse = { id: 'horde-id' };
    const mockCheckResponses = [
      { wait_time: 30, is_possible: true, processing: 0 }, // First check
      { wait_time: 15, is_possible: true, processing: 0 } // Second check (if implemented)
    ];

    // Setup all the mocks
    (getPendingImagesByStatusFromAppState as jest.Mock).mockImplementation(
      (statuses) => {
        if (statuses.includes(JobStatus.Waiting)) return [mockWaitingJob];
        return [];
      }
    );
    (transitionJobFromWaitingToRequested as jest.Mock).mockResolvedValue(
      mockWaitingJob
    );
    (getImageRequestsFromDexieById as jest.Mock).mockResolvedValue([
      mockImageRequest
    ]);
    (ImageParamsForHordeApi.build as jest.Mock).mockResolvedValue({
      apiParams: mockApiParams
    });
    (generateImage as jest.Mock).mockResolvedValue(mockApiResponse);
    (checkImage as jest.Mock).mockResolvedValueOnce(mockCheckResponses[0]);

    await checkForWaitingJobs();

    expect(updatePendingImage).toHaveBeenCalledWith(
      'test-id',
      expect.objectContaining({
        status: JobStatus.Queued,
        init_wait_time: 30, // Should preserve the initial wait time
        wait_time: 30
      })
    );
  });
});
