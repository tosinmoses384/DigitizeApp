import { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@redux/store';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';

interface WardrobeItem {
  id: string;
  brandName: string;
  itemDefaultImageUrl: string;
  brand: string;
  defaultImageUrl: string;
  title?: string;
  category?: string;
  price?: number;
}

interface UseWardrobeItemsResult {
  items: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  refreshItems: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useWardrobeItems = (): UseWardrobeItemsResult => {
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);

  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageToken, setPageToken] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback(async (isRefresh: boolean = false) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentPageToken = isRefresh ? '' : pageToken;

      const response = await wardrobeServices.itemsQuery(
        token,
        '',
        '20',
        profile?.id || '',
        currentPageToken,
        ''
      );

      if (response?.data?.dataset) {
        const formattedItems = response.data.dataset.map((item: any) => ({
          id: item.id,
          brandName: item.brand,
          itemDefaultImageUrl: item.defaultImageUrl,
          brand: item.brand,
          defaultImageUrl: item.defaultImageUrl,
          title: item.title,
          category: item.category,
          price: item.amount,
          ...item,
        }));

        if (isRefresh) {
          setItems(formattedItems);
        } else {
          setItems(prev => [...prev, ...formattedItems]);
        }

        if (response.data.hasNextPage && response.data.pageToken) {
          setPageToken(response.data.pageToken);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wardrobe items';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, pageToken, isLoading, profile?.id]);

  const refreshItems = useCallback(async (): Promise<void> => {
    setPageToken('');
    setHasMore(true);
    await fetchItems(true);
  }, [fetchItems]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (hasMore && !isLoading) {
      await fetchItems(false);
    }
  }, [hasMore, isLoading, fetchItems]);

  useEffect(() => {
    if (token) {
      refreshItems();
    }

    // PERFORMANCE: Cleanup on unmount to prevent memory leaks
    return () => {
      setItems([]);
      setPageToken('');
      setHasMore(false);
      setIsLoading(false);
      setError(null);
    };
  }, [token]);

  return {
    items,
    isLoading,
    error,
    refreshItems,
    hasMore,
    loadMore,
  };
};
