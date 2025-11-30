import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePaginatedQuery } from './use-paginated-query';
import marketPlaceServices from '@services/features/marketplace/marketplaceServices';

export interface SellerReview {
  id: string;
  reviewId?: string;
  createdBy: string;
  trifterImageUrl: string;
  review: string;
  ratings: number;
}

interface UseSellerReviewsParams {
  sellerId: string;
  token: string;
  countryId: string;
  pageSize?: string;
  enabled?: boolean;
  refetchOnFocus?: boolean;
}

export const useSellerReviews = ({
  sellerId,
  token,
  countryId,
  pageSize = '12',
  enabled = true,
  refetchOnFocus = true,
}: UseSellerReviewsParams) => {
  const fetchReviews = async (pageToken: string) => {
    const response = await marketPlaceServices.userReviewsQuery(countryId, {
      token,
      trifterId: sellerId,
      pageSize,
      pageToken,
    });

    if (response?.status !== 200) {
      throw new Error(response?.message || 'Failed to fetch reviews');
    }

    return response;
  };

  const query = usePaginatedQuery<SellerReview>({
    queryKey: ['sellerReviews', sellerId, countryId, pageSize],
    queryFn: fetchReviews,
    enabled: enabled && !!sellerId && !!token && !!countryId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 2,
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

