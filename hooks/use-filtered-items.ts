import { useQuery } from '@tanstack/react-query';
import marketPlaceServices from '@services/features/marketplace/marketplaceServices';

export interface FilteredItem {
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

interface UseFilteredItemsParams {
  sellerId: string;
  token: string;
  countryId: string;
  categoryId?: string;
  sizeIds?: string[];
  brandIds?: string[];
  conditionIds?: string[];
  colourIds?: string[];
  materialIds?: string[];
  enabled?: boolean;
}

export const useFilteredItems = ({
  sellerId,
  token,
  countryId,
  categoryId = '',
  sizeIds = [],
  brandIds = [],
  conditionIds = [],
  colourIds = [],
  materialIds = [],
  enabled = false,
}: UseFilteredItemsParams) => {
  return useQuery<FilteredItem[]>({
    queryKey: [
      'filteredSellerItems',
      sellerId,
      countryId,
      categoryId,
      sizeIds,
      brandIds,
      conditionIds,
      colourIds,
      materialIds,
    ],
    queryFn: async () => {
      const response = await marketPlaceServices.marketPlaceItemsQuery(
        token,
        countryId,
        {
          Query: '',
          PageQuery: '',
          PageSize: '50',
          PageToken: '',
          CategoryId: categoryId,
          TrifterIds: [sellerId] as any,
          SizeIds: sizeIds,
          BrandIds: brandIds,
          ConditionIds: conditionIds,
          ColourIds: colourIds,
          MaterialIds: materialIds,
          price: {
            Minimum: '',
            Maximum: '',
          },
        } as any
      );

      if (response?.status !== 200 || !(response as any)?.data?.dataset) {
        throw new Error('Failed to fetch filtered items');
      }

      return (response as any).data.dataset;
    },
    enabled: enabled && !!sellerId && !!token && !!countryId,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
};

