import React, { memo, useCallback } from "react";
import { RefreshControl, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import ItemCard from "@components/ItemCard";
import { Post } from "@hooks/use-posts-data";
import Animated from "react-native-reanimated";

// Props interface following coding guide section 3
export interface ItemsGridProps {
  posts: Post[];
  activeTab: string;
  onLikePost: (post: Post) => void;
  onRefreshPosts: () => void;
  refreshing: boolean;

  renderListHeaderComponent?: () => React.ReactElement | null;
  renderListFooterComponent?: (
    loadingMore?: boolean,
    hasMore?: boolean,
  ) => React.ReactElement | null;
  onScroll?: () => void;
  maxHeaderHeight?: number;
  onEndReached?: () => void;
}

const SellerProfileItemsGrid: React.FC<ItemsGridProps> = memo(
  ({
    posts,
    activeTab,
    onLikePost,
    onRefreshPosts,
    refreshing,
    renderListHeaderComponent,
    renderListFooterComponent,
    onScroll,
    maxHeaderHeight = 0,
    onEndReached,
  }) => {
    // Memoized navigation handler
    const handleItemPress = useCallback(
      (item: Post) => {
        if (!item?.id) return;

        if (activeTab === "ItemPost") {
          router.push({
            pathname: "/ItemDetails",
            params: {
              itemId: item.id,
              itemData: JSON.stringify(item),
              username:
                item.username || item.sellerUsername || item.posterUsername,
              userId: item.userId || item.sellerId,
            },
          });
        } else if (activeTab === "OutfitPost") {
          router.push({
            pathname: "/OutfitDetails",
            params: {
              outfitId: item.id,
              outfitData: JSON.stringify(item),
              username:
                item.username || item.sellerUsername || item.posterUsername,
              userId: item.userId || item.sellerId,
            },
          });
        }
      },
      [activeTab],
    );

    // Memoized render function for individual grid items
    const renderGridItem = useCallback(
      ({ item }: { item: Post }) => (
        <View style={styles.gridItem}>
          <ItemCard
            item={item}
            onPress={() => handleItemPress(item)}
            onLike={() => onLikePost(item)}
            isLiked={item?.isLiked || false}
            likeCount={item?.likesCount || 0}
          />
        </View>
      ),
      [handleItemPress, onLikePost],
    );

    // Memoized key extractor for performance - ensure uniqueness
    const keyExtractor = useCallback((item: Post, index: number) => {
      // Create a unique key combining multiple identifiers
      const baseId = item.id || `item-${index}`;
      const timestamp = item.createdOn || Date.now();
      const userId = item.userId || item.sellerId || "";
      const username =
        item.username || item.sellerUsername || item.posterUsername || "";

      // Combine identifiers to ensure uniqueness
      return `${baseId}-${userId}-${username}-${timestamp}-${index}`;
    }, []);

    return (
      <View style={styles.gridContainer}>
        <Animated.FlatList
          data={posts}
          renderItem={renderGridItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={6}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              tintColor="#FF5C68"
              refreshing={refreshing}
              onRefresh={onRefreshPosts}
            />
          }
          accessibilityRole="list"
          accessibilityLabel="Items grid"
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            ...styles.contentContainer,
            paddingTop: maxHeaderHeight,
          }}
          ListHeaderComponent={renderListHeaderComponent}
          ListFooterComponent={
            renderListFooterComponent ? () => renderListFooterComponent() : null
          }
          onScroll={onScroll}
          onEndReached={onEndReached}
        />
      </View>
    );
  },
);

SellerProfileItemsGrid.displayName = "SellerProfileItemsGrid";

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
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
});

export default SellerProfileItemsGrid;
