import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppSelector } from '@redux/store';
import ItemCard from '@components/ItemCard';
import wardrobeServices from '@services/features/wardrobe-service/wardrobeServices';
import GridSkeleton from '@components/GridSkeleton';

export interface ProfileWardrobeOutfitsListProps {
  onOutfitPress?: (outfit: any) => void;
  outfitDetailRoute?: string;
}

const ProfileWardrobeOutfitsList: React.FC<ProfileWardrobeOutfitsListProps> = ({
  onOutfitPress,
  outfitDetailRoute = '/OutfitDetails',
}) => {
  const { token, profile } = useAppSelector((state) => state?.userProfileSlice);
  
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Use same name as wardrobe component
  const [pageToken, setPageToken] = useState<string | null>(null);

  const pageSize = '12';

  // Initial load - EXACT same pattern as wardrobe component getInitialOutfits (line 491-520)
  const getInitialOutfits = useCallback(() => {
    setPageToken(null);
    setOutfits([]);
    setLoading(true);

    wardrobeServices.outfitsQuery(
      token,
      profile?.id || '',
      '', // empty query string
      pageSize,
      '', // empty pageToken for initial load
    )
      .then((res: any) => {
        setLoading(false);
        const newOutfits = res?.data?.dataset || [];
        setOutfits(newOutfits || []);

        // Only set pageToken if hasNextPage is true (EXACT same as wardrobe line 510-512)
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
  }, [token, profile?.id, pageSize]);

  // Initial load
  useEffect(() => {
    if (token) {
      getInitialOutfits();
    }
  }, [getInitialOutfits, token]);

  // Handle refresh - EXACT same pattern as wardrobe component
  const handleRefresh = useCallback(() => {
    setPageToken(null);
    getInitialOutfits();
  }, [getInitialOutfits]);

  // Handle load more - EXACT same pattern as wardrobe component getMoreOutfits (line 385-405)
  const handleLoadMore = useCallback(() => {
    // EXACT same check as wardrobe component line 386: pageToken && !isFetchingMore
    if (pageToken && !isFetchingMore) {
      setIsFetchingMore(true);

      wardrobeServices.outfitsQuery(
        token,
        profile?.id || '',
        '', // empty query string
        pageSize,
        pageToken,
      )
        .then((res: any) => {
          if (res?.responseCode === '0' && res?.data) {
            const newOutfits = res?.data?.dataset || [];

            // Append outfits (EXACT same as wardrobe line 392)
            setOutfits((prevOutfits) => [...prevOutfits, ...(newOutfits || [])]);

            // Set pageToken directly from response (EXACT same as wardrobe line 394)
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
  }, [pageToken, isFetchingMore, token, profile?.id, pageSize]);

  // Handle outfit press
  const handleOutfitPress = useCallback(
    (outfit: any) => {
      if (onOutfitPress) {
        onOutfitPress(outfit);
        return;
      }

      // Default navigation behavior
      router.push({
        pathname: outfitDetailRoute as any,
        params: {
          outfitId: outfit.id,
          outfitData: JSON.stringify(outfit),
          username: outfit.username || outfit.sellerUsername || outfit.posterUsername || 'User',
          userId: outfit.userId || outfit.sellerId,
        },
      });
    },
    [onOutfitPress, outfitDetailRoute],
  );

  // Transform wardrobe outfit to ItemCard format
  const transformOutfit = useCallback((wardrobeOutfit: any) => {
    return {
      id: wardrobeOutfit.id,
      defaultImageUrl: wardrobeOutfit.defaultImageUrl || wardrobeOutfit.imageUrl,
      imageUrl: wardrobeOutfit.imageUrl || wardrobeOutfit.defaultImageUrl,
      brand: wardrobeOutfit.name || wardrobeOutfit.title || 'Outfit',
      size: '',
      amount: '0',
      username: wardrobeOutfit.username || wardrobeOutfit.sellerUsername || 'User',
      userImageUrl: wardrobeOutfit.userImageUrl || wardrobeOutfit.sellerImageUrl,
      isFavourite: wardrobeOutfit.isFavourite || false,
      favouriteCount: wardrobeOutfit.favouriteCount || 0,
      hasTag: wardrobeOutfit.hasTag || false,
      ...wardrobeOutfit,
    };
  }, []);

  // Memoized transformed outfits
  const transformedOutfits = useMemo(
    () => outfits.map(transformOutfit),
    [outfits, transformOutfit],
  );

  // Render grid item
  const renderGridItem = useCallback(
    ({ item }: { item: any }) => (
      <View style={styles.gridItem}>
        <ItemCard
          item={item}
          onPress={() => handleOutfitPress(item)}
          isLiked={item?.isFavourite || false}
          likeCount={item?.favouriteCount || 0}
        />
      </View>
    ),
    [handleOutfitPress],
  );

  // Key extractor
  const keyExtractor = useCallback(
    (item: any, index: number) => item.id || `outfit-${index}`,
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
  if (loading && outfits.length === 0) {
    return (
      <View style={styles.container}>
        <GridSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={transformedOutfits}
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
        accessibilityLabel="Wardrobe outfits grid"
        // Styling
        style={styles.flatList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
};

ProfileWardrobeOutfitsList.displayName = 'ProfileWardrobeOutfitsList';

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
});

export default ProfileWardrobeOutfitsList;

