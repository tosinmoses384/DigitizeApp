import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePaginatedQuery } from './use-paginated-query';
import timelineServices from '@services/features/timeline-service/timelineServices';

export interface SellerPost {
  id: string;
  userId: string;
  username: string;
  userRatings: number;
  userImageUrl: string;
  caption: string;
  defaultImageUrl: string;
  type: string;
  hasTag: boolean;
  likesCount: number;
  commentCount: number;
  isLiked: boolean;
  isEditable: boolean;
  isFollowing: boolean;
  createdOn: string;
  title?: string;
  sellerUsername?: string;
  posterUsername?: string;
  sellerId?: string;
}

interface UseSellerPostsParams {
  sellerId: string;
  token: string;
  countryId: string;
  filterByType?: string;
  filterByCategory?: string;
  pageSize?: string;
  enabled?: boolean;
  refetchOnFocus?: boolean;
}

export const useSellerPosts = ({
  sellerId,
  token,
  countryId,
  filterByType = '',
  filterByCategory = 'TimelinePosts',
  pageSize = '12',
  enabled = true,
  refetchOnFocus = true,
}: UseSellerPostsParams) => {
  const fetchPosts = async (pageToken: string) => {
    const response = await timelineServices.getTimelinesQuery(
      token,
      countryId,
      {
        pageSize,
        pageToken,
        filterByCategory,
        filterByType,
        sellerId,
      }
    );

    if (response?.status !== 200) {
      throw new Error(response?.message || 'Failed to fetch posts');
    }

    return response;
  };

  const query = usePaginatedQuery<SellerPost>({
    queryKey: [
      'sellerPosts',
      sellerId,
      countryId,
      filterByType,
      filterByCategory,
      pageSize,
    ],
    queryFn: fetchPosts,
    enabled: enabled && !!sellerId && !!token && !!countryId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });

  useFocusEffect(
    useCallback(() => {
      if (refetchOnFocus && enabled && sellerId && token && countryId) {
        query.refetch();
      }
    }, [refetchOnFocus, enabled, sellerId, token, countryId, query.refetch])
  );

  return query;
};

