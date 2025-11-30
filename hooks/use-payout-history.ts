import { useAppSelector } from '@redux/store';
import walletService, { IPayoutHistoryItem } from '@services/walletService';
import { usePaginatedQuery } from './use-paginated-query';

export interface PayoutHistoryFilters {
  requestStatus?: string;
  startDate?: string;
  endDate?: string;
}

interface UsePayoutHistoryOptions {
  filters?: PayoutHistoryFilters;
}

export const usePayoutHistory = (options?: UsePayoutHistoryOptions) => {
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const { filters } = options || {};

  const query = usePaginatedQuery<IPayoutHistoryItem>({
    queryKey: ['payoutHistory', filters?.requestStatus, filters?.startDate, filters?.endDate],
    queryFn: async (pageParam: string) => {
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await walletService.getPayoutHistory(
        token,
        20,
        pageParam || undefined,
        filters
      );

      if (response?.status === 200 && response?.data) {
        const data = response.data;
        
        if (data.dataset && Array.isArray(data.dataset)) {
          return {
            data: {
              dataset: data.dataset,
              hasNextPage: data.hasNextPage || false,
              pageToken: data.pageToken || null,
            },
          };
        }

        if (Array.isArray(data)) {
          return {
            data: {
              dataset: data,
              hasNextPage: false,
              pageToken: null,
            },
          };
        }

        if (Array.isArray((data as any).data)) {
          const nestedData = (data as any).data;
          return {
            data: {
              dataset: nestedData,
              hasNextPage: (data as any).hasNextPage || false,
              pageToken: (data as any).pageToken || null,
            },
          };
        }
      }

      return {
        data: {
          dataset: [],
          hasNextPage: false,
          pageToken: null,
        },
      };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return query;
};

