/**
 * Test file to verify race condition fix in StoryLine component
 * This test demonstrates that request cancellation prevents wrong data from being displayed
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { usePostsData } from '../hooks/use-posts-data';

// Mock the timeline services
jest.mock('../services/features/timeline-service/timelineServices', () => ({
  getPostQuery: jest.fn(),
}));

// Mock Redux store
jest.mock('../redux/store', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: () => ({
    token: 'mock-token',
    refetchPostList: false,
    fetchMoreItem: false,
  }),
}));

// Mock toast
jest.mock('react-native-toast-notifications', () => ({
  useToast: () => ({
    show: jest.fn(),
  }),
}));

describe('Race Condition Fix in usePostsData', () => {
  const mockTimelineServices = require('../services/features/timeline-service/timelineServices');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should cancel previous request when activeTab changes', async () => {
    // Mock API responses with delays
    const firstResponse = Promise.resolve({
      responseCode: 200,
      data: {
        data: {
          dataset: [{ id: '1', type: 'ItemPost', caption: 'Item 1' }],
          pageToken: 'token1',
        },
      },
    });

    const secondResponse = Promise.resolve({
      responseCode: 200,
      data: {
        data: {
          dataset: [{ id: '2', type: 'OutfitPost', caption: 'Outfit 1' }],
          pageToken: 'token2',
        },
      },
    });

    // Mock getPostQuery to return different responses based on signal
    mockTimelineServices.getPostQuery.mockImplementation((token, pageSize, pageToken, activeTab, filterByCategory, sellerId, filterByType, signal) => {
      if (activeTab === 'ItemPost') {
        return firstResponse;
      } else if (activeTab === 'OutfitPost') {
        return secondResponse;
      }
      return Promise.resolve({ responseCode: 200, data: { data: { dataset: [], pageToken: '' } } });
    });

    const { result, rerender } = renderHook(
      ({ activeTab }) => usePostsData({ activeTab, filterByCategory: '', sellerId: '', filterByType: '' }),
      { initialProps: { activeTab: 'ItemPost' } }
    );

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Change activeTab to trigger new request
    rerender({ activeTab: 'OutfitPost' });

    // Wait for the second request
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify that getPostQuery was called with abort signal
    expect(mockTimelineServices.getPostQuery).toHaveBeenCalledWith(
      'mock-token',
      expect.any(String),
      '',
      'OutfitPost',
      '',
      '',
      '',
      expect.any(Object) // AbortSignal
    );
  });

  it('should not update state if request was cancelled', async () => {
    let resolveFirstRequest: (value: any) => void;
    const firstRequestPromise = new Promise(resolve => {
      resolveFirstRequest = resolve;
    });

    mockTimelineServices.getPostQuery.mockImplementation((token, pageSize, pageToken, activeTab, filterByCategory, sellerId, filterByType, signal) => {
      if (activeTab === 'ItemPost') {
        return firstRequestPromise;
      } else if (activeTab === 'OutfitPost') {
        return Promise.resolve({
          responseCode: 200,
          data: {
            data: {
              dataset: [{ id: '2', type: 'OutfitPost', caption: 'Outfit 1' }],
              pageToken: 'token2',
            },
          },
        });
      }
      return Promise.resolve({ responseCode: 200, data: { data: { dataset: [], pageToken: '' } } });
    });

    const { result, rerender } = renderHook(
      ({ activeTab }) => usePostsData({ activeTab, filterByCategory: '', sellerId: '', filterByType: '' }),
      { initialProps: { activeTab: 'ItemPost' } }
    );

    // Start first request
    act(() => {
      // This will trigger the first request
    });

    // Immediately change to second tab
    rerender({ activeTab: 'OutfitPost' });

    // Wait for second request to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Now resolve the first request (which should be cancelled)
    act(() => {
      resolveFirstRequest!({
        responseCode: 200,
        data: {
          data: {
            dataset: [{ id: '1', type: 'ItemPost', caption: 'Item 1' }],
            pageToken: 'token1',
          },
        },
      });
    });

    // Wait a bit more
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify that the state contains the correct data (from OutfitPost, not ItemPost)
    expect(result.current.postsState.posts).toEqual([
      { id: '2', type: 'OutfitPost', caption: 'Outfit 1' }
    ]);
  });
});
