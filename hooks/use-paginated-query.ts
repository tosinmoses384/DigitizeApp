import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo } from 'react';

interface PaginatedQueryParams<TData> {
  queryKey: string[];
  queryFn: (pageParam: string) => Promise<any>;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  staleTime?: number;
}

interface ApiResponse {
  data: {
    dataset: any[];
    pageToken: string | number;
    hasNextPage: boolean;
  };
}

export const usePaginatedQuery = <TData>({
  queryKey,
  queryFn,
  enabled = true,
  refetchOnWindowFocus = true,
  refetchOnMount = true,
  staleTime,
}: PaginatedQueryParams<TData>) => {
  const query = useInfiniteQuery<{ data: TData[]; meta: { pageToken: string | null; hasNextPage: boolean } }, AxiosError>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      if (__DEV__) {
        console.log('usePaginatedQuery: queryFn called with pageParam:', pageParam);
      }
      
      const response = await queryFn(pageParam as string);
      
      const hasNextPage = response?.data?.hasNextPage || false;
      const nextToken = response?.data?.pageToken?.toString() || null;
      const dataset = response?.data?.dataset || [];
      
      if (__DEV__) {
        console.log('usePaginatedQuery: API response:', {
          hasNextPage,
          pageToken: nextToken,
          datasetLength: dataset.length,
        });
      }
      
      const shouldFetchMore = hasNextPage && nextToken && dataset.length > 0;
      
      if (__DEV__ && dataset.length === 0 && hasNextPage) {
        console.warn('usePaginatedQuery: Empty dataset with hasNextPage=true. Stopping pagination to prevent infinite loop.');
      }
      
      return {
        data: dataset,
        meta: {
          pageToken: shouldFetchMore ? nextToken : null,
          hasNextPage: shouldFetchMore,
        },
      };
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      if (__DEV__) {
        console.log('usePaginatedQuery: getNextPageParam called with:', {
          hasNextPage: lastPage.meta.hasNextPage,
          pageToken: lastPage.meta.pageToken,
        });
      }
      
      if (lastPage.meta.hasNextPage && lastPage.meta.pageToken) {
        return lastPage.meta.pageToken;
      }
      
      return undefined;
    },
    enabled,
    refetchOnWindowFocus,
    refetchOnMount,
    staleTime,
  });

  const data = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap(page => page.data);
  }, [query.data]);

  const loadMoreData = () => {
    if (__DEV__) {
      console.log('usePaginatedQuery: loadMoreData called:', {
        isLoading: query.isLoading,
        isFetchingNextPage: query.isFetchingNextPage,
        hasNextPage: query.hasNextPage,
      });
    }
    
    if (!query.isLoading && !query.isFetchingNextPage && query.hasNextPage) {
      if (__DEV__) {
        console.log('usePaginatedQuery: Calling fetchNextPage');
      }
      query.fetchNextPage();
    }
  };

  return {
    ...query,
    data,
    loadMoreData,
  };
};

