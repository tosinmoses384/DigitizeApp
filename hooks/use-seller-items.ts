import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { usePaginatedQuery } from './use-paginated-query';
import marketPlaceServices from '@services/features/marketplace/marketplaceServices';

export interface SellerItem {
  id: string;
  title: string;
  description: string;
  brandName: string;
  size: string;
  price: number;
  defaultImageUrl: string;
  imageUrls: string[];
  isUserFavorite: boolean;
  favouriteCount: number;
  currencySymbol: string;
  categoryId: string;
  category: string;
  brandId: string;
  sizeId: string;
  trifterName: string;
}

interface UseSellerItemsParams {
  sellerId: string;
  token: string;
  countryId: string;
  pageSize?: string;
  enabled?: boolean;
  refetchOnFocus?: boolean;
}

export const useSellerItems = ({
  sellerId,
  token,
  countryId,
  pageSize = '12',
  enabled = true,
  refetchOnFocus = true,
}: UseSellerItemsParams) => {
  const fetchItems = async (pageToken: string) => {
    const response = await marketPlaceServices.userlistItemsQuery(
      countryId,
      sellerId,
      {
        token,
        pageQuery: '',
        pageSize,
        pageToken,
      }
    );

    if (response?.status !== 200) {
      throw new Error(response?.message || 'Failed to fetch items');
    }

    return response;
  };

  const query = usePaginatedQuery<SellerItem>({
    queryKey: ['sellerItems', sellerId, countryId, pageSize],
    queryFn: fetchItems,
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
