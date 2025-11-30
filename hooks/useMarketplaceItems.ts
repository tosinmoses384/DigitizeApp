import { useState, useCallback, useMemo } from 'react';
import marketPlaceServices from '@services/features/marketplace/marketplaceServices';

interface FilterValues {
  conditionValue?: { id: string };
  brandValue?: { id: string };
  colourValue?: { id: string };
  sizeValue?: { id: string };
  materialValue?: { id: string };
}

interface UseMarketplaceItemsProps {
  token?: string;
  countryId?: string;
  profile?: { countryId?: string };
  search: string;
  selectedCategory?: { id: string };
  selectedSubcategory?: string;
  source?: string;
  filterValues: FilterValues;
}

export const useMarketplaceItems = ({
  token,
  countryId,
  profile,
  search,
  selectedCategory,
  selectedSubcategory,
  source,
  filterValues,
}: UseMarketplaceItemsProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [pageToken, setPageToken] = useState('');
  const [screenLoader, setScreenLoader] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Memoize query object to prevent unnecessary re-renders
  const queryObject = useMemo(() => {
    const baseQuery: any = {
      Query: search || '',
      CategoryId: selectedCategory?.id || '',
      price: { Minimum: '', Maximum: '' },
      PageSize: '12',
      PageToken: '',
      TrifterIds: [],
      ConditionIds: [],
      BrandIds: [],
      ColourIds: [],
      SizeIds: [],
      MaterialIds: [],
    };

    // Only add filter arrays if they have values
    if (filterValues.conditionValue?.id) {
      baseQuery.ConditionIds = [filterValues.conditionValue.id];
    }
    if (filterValues.brandValue?.id) {
      baseQuery.BrandIds = [filterValues.brandValue.id];
    }
    if (filterValues.colourValue?.id) {
      baseQuery.ColourIds = [filterValues.colourValue.id];
    }
    if (filterValues.sizeValue?.id) {
      baseQuery.SizeIds = [filterValues.sizeValue.id];
    }
    if (filterValues.materialValue?.id) {
      baseQuery.MaterialIds = [filterValues.materialValue.id];
    }

    return baseQuery;
  }, [
    search,
    selectedCategory?.id,
    filterValues.conditionValue?.id,
    filterValues.brandValue?.id,
    filterValues.colourValue?.id,
    filterValues.sizeValue?.id,
    filterValues.materialValue?.id,
  ]);


  // Fetch items from server
  const fetchItems = useCallback(async (isLoadMore = false) => {
    if (!token) return;

    const query = {
      ...queryObject,
      PageQuery: '',
      PageToken: isLoadMore ? pageToken : '',
    };

    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setProducts([]);
      setPageToken('');
      setScreenLoader(true);
    }

    try {
      // Console log the full endpoint URL used in marketPlaceServices.marketPlaceItemsQuery
      const countryIdForUrl = profile?.countryId || countryId || '';
      
      const res = await marketPlaceServices.marketPlaceItemsQueryUpdated(
        token,
        countryIdForUrl,
        query
      );
     

      // Transform items inline to avoid dependency issues
      let transformedItems = (res as any)?.data?.dataset?.map((list: any) => ({
        id: list?.id,
        title: `${list?.brandName}`,
        size: list?.size,
        amount: list?.price,
        image: list?.defaultImageUrl,
        categoryId: list?.categoryId,
        ...list,
      })) || [];

      // Only apply subcategory filter if navigating from home
      if (
        source === 'home' &&
        selectedSubcategory &&
        selectedSubcategory !== 'all'
      ) {
        transformedItems = transformedItems.filter(
          (item: any) => item.categoryId === selectedSubcategory,
        );
      }

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...transformedItems]);
      } else {
        setProducts(transformedItems);
      }
      
      setPageToken((res as any)?.data?.pageToken || '');
    } catch (error) {
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setScreenLoader(false);
      }
    }
  }, [token, profile?.countryId, countryId, queryObject, pageToken, source, selectedSubcategory]);

  // Load more items
  const loadMoreItems = useCallback(() => {
    if (!pageToken || loadingMore) return;
    fetchItems(true);
  }, [pageToken, loadingMore, fetchItems]);

  // Refresh items (for external triggers)
  const refreshItems = useCallback(() => {
    fetchItems(false);
  }, [fetchItems]);

  return {
    products,
    screenLoader,
    loadingMore,
    pageToken,
    fetchItems: refreshItems,
    loadMoreItems,
  };
};
