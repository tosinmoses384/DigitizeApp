import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppSelector } from '@redux/store';
import ItemCard from '@components/ItemCard';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import GridSkeleton from '@components/GridSkeleton';

export interface ProfileWardrobeItemsListProps {
  onItemPress?: (item: any) => void;
  itemDetailRoute?: string;
}

const ProfileWardrobeItemsList: React.FC<ProfileWardrobeItemsListProps> = ({
  onItemPress,
  itemDetailRoute = '/ItemDetails',
}) => {
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Use same name as wardrobe component
  const [pageToken, setPageToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pageSize = '12';

  // Initial load - EXACT same pattern as wardrobe component getInitialItems (line 450-489)
  const getInitialItems = useCallback(() => {
    setPageToken(null);
    setItems([]);
    setLoading(true);

    wardrobeServices.getAllWardrobeItems(
      token,
      pageSize,
      undefined,
      profile?.id || '',
    )
      .then((res: any) => {
        setLoading(false);

        const newItems = res?.data?.dataset || [];
        setItems(newItems || []);

        // Only set pageToken if hasNextPage is true (EXACT same as wardrobe line 479-480)
        if (res?.data?.hasNextPage) {
          setPageToken(res?.data?.pageToken || null);
        } else {
          setPageToken(null);
        }

        if (res?.responseCode === 401 || res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token, pageSize, profile?.id]);

  // Initial load
  useEffect(() => {
    if (token) {
      getInitialItems();
    }
  }, [getInitialItems, token]);

  // Handle refresh - EXACT same pattern as wardrobe component
  const handleRefresh = useCallback(() => {
    setPageToken(null);
    getInitialItems();
  }, [getInitialItems]);

  // Handle load more - EXACT same pattern as wardrobe component getItems (line 340-383)
  const handleLoadMore = useCallback(() => {
    // EXACT same check as wardrobe component line 341: pageToken && !isFetchingMore
    if (pageToken && !isFetchingMore) {
      setIsFetchingMore(true);

      wardrobeServices.getAllWardrobeItems(
        token,
        pageSize,
        pageToken,
        profile?.id || '',
      )
        .then((res: any) => {
          if (res?.responseCode === '0' && res?.data) {
            const newItems = res?.data?.dataset || [];

            // Append items (EXACT same as wardrobe line 370)
            setItems((prevItems) => [...prevItems, ...(newItems || [])]);

            // Set pageToken directly from response (EXACT same as wardrobe line 372)
            setPageToken(res?.data?.pageToken || null);

            if (res?.responseCode === "401" || res?.responseCode === 401) {
              return router.push("/Onboarding");
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsFetchingMore(false);
        });
    }
  }, [pageToken, isFetchingMore, token, pageSize, profile?.id]);
  

  // Handle item press
  const handleItemPress = useCallback(
    (item: any) => {
      if (onItemPress) {
        onItemPress(item);
        return;
      }

      // Default navigation behavior
      router.push({
        pathname: itemDetailRoute as any,
        params: {
          itemId: item.id,
          itemData: JSON.stringify(item),
          username: item.username || item.sellerUsername || item.posterUsername || 'User',
          userId: item.userId || item.sellerId,
        },
      });
    },
    [onItemPress, itemDetailRoute],
  );

  // Transform wardrobe item to ItemCard format
  const transformItem = useCallback((wardrobeItem: any) => {
    return {
      id: wardrobeItem.id,
      defaultImageUrl: wardrobeItem.defaultImageUrl || wardrobeItem.itemDefaultImageUrl,
      imageUrl: wardrobeItem.imageUrl || wardrobeItem.itemImageUrls?.[0],
      brand: wardrobeItem.brandName || wardrobeItem.brand || 'Brand',
      size: wardrobeItem.size || 'Size',
      amount: wardrobeItem.price || '0',
      username: wardrobeItem.username || wardrobeItem.sellerUsername || 'User',
      userImageUrl: wardrobeItem.userImageUrl || wardrobeItem.sellerImageUrl,
      isFavourite: wardrobeItem.isFavourite || false,
      favouriteCount: wardrobeItem.favouriteCount || 0,
      hasTag: wardrobeItem.hasTag || false,
      ...wardrobeItem,
    };
  }, []);

  // Memoized transformed items
  const transformedItems = useMemo(
    () => items.map(transformItem),
    [items, transformItem],
  );

  // Render grid item
  const renderGridItem = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.gridItem}>
        <ItemCard
          item={item}
          onPress={() => handleItemPress(item)}
          isLiked={item?.isFavourite || false}
          likeCount={item?.favouriteCount || 0}
        />
      </View>
    ),
    [handleItemPress],
  );

  // Key extractor
  const keyExtractor = useCallback(
    (item: any, index: number) => item.id || `item-${index}`,
    [],
  );

  // Footer loader - EXACT same pattern as wardrobe component (line 95-104)
  const renderFooter = useCallback(() => {
    if (isFetchingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#FF5C68" />
        </View>
      );
    }
    return null;
  }, [isFetchingMore]);

  // Loading state
  if (loading && items.length === 0) {
    return (
      <View style={styles.container}>
        <GridSkeleton />
      </View>
    );
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#FF3B4A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transformedItems}
        renderItem={renderGridItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        ListFooterComponent={renderFooter}
        // Performance optimizations
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        // Infinite scroll - EXACT same as wardrobe component (line 144)
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        // Maintain exact same spacing as original
        columnWrapperStyle={styles.row}
        // RefreshControl for pull-to-refresh
        refreshControl={
          <RefreshControl
            tintColor="#FF5C68"
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        // Accessibility
        accessibilityRole="list"
        accessibilityLabel="Wardrobe items grid"
        // Styling
        style={styles.flatList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

ProfileWardrobeItemsList.displayName = 'ProfileWardrobeItemsList';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
  },
  flatList: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 50,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default ProfileWardrobeItemsList;

