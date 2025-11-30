import { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@redux/store';
import { useApiService } from '@hooks/use-auth-guard/useApiService';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';

export interface TrifterItem {
  id: string;
  userId?: string;
  name?: string;
  followersCount?: number;
  isFollowing?: boolean;
}

interface UseTriftersDataProps {
  userId?: string;
  followingStatus?: number;
  searchQuery: string;
}

export const useTriftersData = ({ userId, followingStatus, searchQuery }: UseTriftersDataProps) => {
  const { token } = useAppSelector(state => state?.userProfileSlice);
  const { callApi } = useApiService();

  const [data, setData] = useState<TrifterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageToken, setPageToken] = useState('');
  const [hasMore, setHasMore] = useState(true);

  // Optimized data fetching function
  const fetchTrifters = useCallback(async (isLoadMore = false, customSearch?: string) => {
    // Prevent duplicate calls
    if ((!isLoadMore && data.length > 0 && !customSearch && !searchQuery) || !hasMore || !token) {
      return;
    }

    const searchTerm = customSearch !== undefined ? customSearch : searchQuery;
    
    setLoading(true);

    try {
      await callApi(
        (token) => {
          return userId
            ? wardrobeServices.triftersUserFollowingQuery(
                token,
                searchTerm || '',
                '12',
                isLoadMore ? pageToken : '',
                userId
              )
            : wardrobeServices.triftersQuery(
                token,
                searchTerm || '',
                '12',
                isLoadMore ? pageToken : '',
                followingStatus || 0
              );
        },
        {
          onSuccess: (res: any) => {
            const newData = res?.data?.dataset || [];
            
            setData(prev => {
              // For search or refresh, replace data
              if (!isLoadMore || customSearch !== undefined) {
                return newData;
              }
              // For load more, append data
              return [...prev, ...newData];
            });
            
            setPageToken(res?.data?.pageToken || '');
            setHasMore(!!res?.data?.pageToken);
            setLoading(false);
            setIsRefreshing(false);
          },
          onError: (error) => {
            console.error('Error fetching trifters:', error);
            setLoading(false);
            setIsRefreshing(false);
          }
        }
      );
    } catch (error) {
      console.error('Error in fetchTrifters:', error);
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, userId, followingStatus, searchQuery, pageToken, hasMore, data.length, callApi]);

  // Optimized refresh function
  const handleRefresh = useCallback(() => {
    setPageToken('');
    setData([]);
    setHasMore(true);
    setIsRefreshing(true);
    fetchTrifters(false);
  }, [fetchTrifters]);

  // Optimized load more function
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && pageToken) {
      fetchTrifters(true);
    }
  }, [loading, hasMore, pageToken, fetchTrifters]);

  // Optimized search function with debouncing effect
  const handleSearch = useCallback((query: string) => {
    setPageToken('');
    setHasMore(true);
    fetchTrifters(false, query);
  }, [fetchTrifters]);

  // Initial data fetch
  useEffect(() => {
    if (token) {
      fetchTrifters();
    }
  }, [token, userId, followingStatus]);

  // Search effect with debouncing
  useEffect(() => {
    if (searchQuery !== '') {
      const timeoutId = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, handleSearch]);

  // Optimized update function for individual items
  const updateItem = useCallback((itemId: string, updates: Partial<TrifterItem>) => {
    setData(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  }, []);

  // Optimized remove function for items (used in following status = 1)
  const removeItem = useCallback((itemId: string) => {
    setData(prev => prev.filter(item => item.id !== itemId));
  }, []);

  return {
    data,
    loading,
    isRefreshing,
    hasMore,
    handleRefresh,
    handleLoadMore,
    updateItem,
    removeItem,
    setData
  };
};
