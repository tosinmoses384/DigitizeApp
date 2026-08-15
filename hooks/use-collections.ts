import { useInfiniteQuery } from '@tanstack/react-query';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import type { Collection, CollectionOutfit } from '../types/collections';

export type { Collection, CollectionOutfit };

interface UseCollectionsOptions {
  token: string;
  enabled?: boolean;
  pageSize?: number;
}

export const useCollections = ({
  token,
  enabled = true,
  pageSize = 20,
}: UseCollectionsOptions) => {
  const query = useInfiniteQuery({
    queryKey: ['collections', token],
    queryFn: async ({ pageParam = '' }) => {
      const response = await wardrobeServices.getOutfitCollections(
        token,
        pageSize.toString(),
        pageParam,
      );

      if (response?.status !== 200) {
        throw new Error(response?.message || 'Failed to fetch collections');
      }

      return {
        data: response.data?.dataset || [],
        nextPageToken: response.data?.pageToken || null,
        hasNextPage: response.data?.hasNextPage || false,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.nextPageToken : undefined;
    },
    initialPageParam: '',
    enabled: enabled && !!token,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  const data = query.data?.pages.flatMap((page) => page.data) || [];

  return {
    ...query,
    data,
    hasNextPage: query.hasNextPage ?? false,
  };
};
