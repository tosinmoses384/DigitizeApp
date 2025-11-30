import { useInfiniteQuery } from '@tanstack/react-query';
import { tagItemsService } from '@services/features/wardrobe-service/tagItemsService';
import {
  TagItemsParams,
  TagItemsResponse,
  WardrobeItem,
  OutfitItem,
} from '@services/features/wardrobe-service/types';
import ApiResponsePayload from '@services/http-client/abstractions/models/ApiResponsePayload';
import { useMemo } from 'react';

interface UseTagItemsConfig {
  token: string;
  type: 'items' | 'outfits';
  searchQuery: string;
  trifterId?: string;
  enabled?: boolean;
  refetchOnMount?: boolean | 'always';
}

export const useTagItems = ({
  token,
  type,
  searchQuery,
  trifterId,
  enabled = true,
  refetchOnMount = false,
}: UseTagItemsConfig) => {
  const queryKey = useMemo(() => ['tagItems', type, searchQuery, trifterId], [type, searchQuery, trifterId]);

  const queryResult = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = null }) => {
      const params: TagItemsParams = {
        query: searchQuery,
        pageSize: 12,
        pageToken: pageParam,
        trifterId,
      };

      if (type === 'items') {
        return tagItemsService.fetchItems(params, token);
      } else {
        return tagItemsService.fetchOutfits(params, token);
      }
    },
    initialPageParam: null,
    getNextPageParam: (
      lastPage: ApiResponsePayload<TagItemsResponse>,
    ) => {
      const lastPageData = lastPage?.data;
      if (!lastPageData?.hasNextPage || !lastPageData?.pageToken) {
        return undefined;
      }
      return lastPageData.pageToken;
    },
    enabled: enabled && !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount,
  });

  const flattenedData = useMemo((): (WardrobeItem | OutfitItem)[] => {
    if (!queryResult.data?.pages) return [];
    
    const result: (WardrobeItem | OutfitItem)[] = [];
    const seenIds = new Set<string>();
    
    queryResult.data.pages.forEach((page) => {
      const dataset = page?.data?.dataset;
      if (!dataset || !Array.isArray(dataset)) return;

      if (type === 'items') {
        const items = dataset
          .filter((item: any) => {
            if (!item?.id || seenIds.has(item.id)) return false;
            seenIds.add(item.id);
            return true;
          })
          .map((item: any): WardrobeItem => {
            const imageUrls = Array.isArray(item.itemImageUrls) 
              ? item.itemImageUrls 
              : [];
            const defaultImage = item.itemDefaultImageUrl || imageUrls[0] || '';

            const amount = typeof item.amount === 'number' 
              ? item.amount 
              : (typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : 0);

            return {
              id: item.id,
              brandName: item.brandName || item.name || 'Unknown Brand',
              itemDefaultImageUrl: defaultImage,
              itemImageUrls: imageUrls,
              amount,
              currencySymbol: item.currencySymbol || '₦',
              type: 'item' as const,
              requestId: item.requestId,
              categoryId: item.categoryId,
              sizeId: item.sizeId,
              colourIds: Array.isArray(item.colourIds) ? item.colourIds : [],
              brand: item.brandName,
            };
          });
        result.push(...items);
      } else {
        const outfits = dataset
          .filter((item: any) => {
            if (!item?.id || seenIds.has(item.id)) return false;
            seenIds.add(item.id);
            return true;
          })
          .map((item: any): OutfitItem => ({
            id: item.id,
            title: item.title || 'Untitled Outfit',
            imageUrl: item.imageUrl || '',
            description: item.description || '',
            type: 'outfit' as const,
            itemIds: Array.isArray(item.itemIds) ? item.itemIds : [],
            isPrivate: Boolean(item.isPrivate),
          }));
        result.push(...outfits);
      }
    });
    
    return result;
  }, [queryResult.data?.pages, type]);

  return {
    data: flattenedData,
    isLoading: queryResult.isLoading,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    hasNextPage: queryResult.hasNextPage,
    fetchNextPage: queryResult.fetchNextPage,
    refetch: queryResult.refetch,
    isRefetching: queryResult.isRefetching,
    isError: queryResult.isError,
    error: queryResult.error,
  };
};
