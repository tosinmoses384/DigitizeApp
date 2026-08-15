import { useInfiniteQuery } from '@tanstack/react-query';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import type { CollectionOutfit } from '../types/collections';

interface UseCollectionOutfitsDetailOptions {
  collectionId: string;
  token: string;
  enabled?: boolean;
  pageSize?: number;
}

export const useCollectionOutfitsDetail = ({
  collectionId,
  token,
  enabled = true,
  pageSize = 20,
}: UseCollectionOutfitsDetailOptions) => {
  const query = useInfiniteQuery({
    queryKey: ['collection-outfits-detail', collectionId, token],
    queryFn: async ({ pageParam = '' }) => {
      const response = await wardrobeServices.getOutfitsInCollection(
        collectionId,
        token,
        pageSize.toString(),
        pageParam,
      );

      if (response?.status !== 200) {
        throw new Error(response?.message || 'Failed to fetch collection outfits');
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
    enabled: enabled && !!token && !!collectionId,
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
