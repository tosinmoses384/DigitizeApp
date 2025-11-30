import React, { memo, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import ItemCard from "@components/ItemCard";
import { Post } from "@hooks/use-posts-data";

// Props interface following coding guide section 3
export interface ItemsGridProps {
  posts: Post[];
  activeTab: string;
  onLikePost: (post: Post) => void;
  onRefreshPosts: () => void;
  onLoadMore: () => void;
  canLoadMore: boolean;
  refreshing: boolean;
  loadingMore?: boolean;
  // Optional props to override detail routes (for new API endpoints)
  itemDetailRoute?: string;
  outfitDetailRoute?: string;
}


const ItemsGrid: React.FC<ItemsGridProps> = memo(({
  posts,
  activeTab,
  onLikePost,
  onRefreshPosts,
  onLoadMore,
  canLoadMore,
  refreshing,
  loadingMore = false,
  itemDetailRoute = '/ItemDetails',
  outfitDetailRoute = '/OutfitDetails',
}) => {
  // Memoized navigation handler
  const handleItemPress = useCallback((item: Post) => {
    if (!item?.id) return;

    if (activeTab === "ItemPost") {
      router.push({
        pathname: itemDetailRoute as any,
        params: {
          itemId: item.id,
          itemData: JSON.stringify(item),
          username: item.username || item.sellerUsername || item.posterUsername,
          userId: item.userId || item.sellerId,
        },
      });
    } else if (activeTab === "OutfitPost") {
      router.push({
        pathname: outfitDetailRoute as any,
        params: {
          outfitId: item.id,
          outfitData: JSON.stringify(item),
          username: item.username || item.sellerUsername || item.posterUsername,
          userId: item.userId || item.sellerId,
        },
      });
    }
  }, [activeTab, itemDetailRoute, outfitDetailRoute]);

  // Memoized render function for individual grid items
  const renderGridItem = useCallback(({ item }: { item: Post }) => (
    <View style={styles.gridItem}>
      <ItemCard
        item={item}
        onPress={() => handleItemPress(item)}
        onLike={() => onLikePost(item)}
        isLiked={item?.isLiked || false}
        likeCount={item?.likesCount || 0}
      />
    </View>
  ), [handleItemPress, onLikePost]);

  // Memoized key extractor for performance - ensure uniqueness
  const keyExtractor = useCallback((item: Post, index: number) => item.id || `item-${index}` , []);

  // Removed getItemLayout: items vary in height and estimated layout caused scroll jumps

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF5C68" />
      </View>
    );
  }, [loadingMore]);

  return (
    <View style={styles.gridContainer}>
      <FlatList
        data={posts}
        renderItem={renderGridItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        ListFooterComponent={renderFooter}
        // Performance optimizations
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        // Pagination handling
        onEndReached={canLoadMore ? onLoadMore : undefined}
        onEndReachedThreshold={0.5}
        // Maintain exact same spacing as original
        columnWrapperStyle={styles.row}
        // RefreshControl for pull-to-refresh
        refreshControl={
          <RefreshControl
            tintColor="#FF5C68"
            refreshing={refreshing}
            onRefresh={onRefreshPosts}
          />
        }
        // Accessibility
        accessibilityRole="list"
        accessibilityLabel="Items grid"
        // Styling
        style={styles.flatList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
});

ItemsGrid.displayName = "ItemsGrid";

const styles = StyleSheet.create({
  gridContainer: {
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

export default ItemsGrid;
