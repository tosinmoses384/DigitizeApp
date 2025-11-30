import React, { memo, useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LegendListRenderItemProps } from "@legendapp/list";
import PostList from "@components/StoryComp/posts";
import { Post } from "@hooks/use-posts-data";
import { PostActionsState } from "@hooks/use-post-actions";
import Animated from "react-native-reanimated";

// Props interface following coding guide section 3
export interface PostsListProps {
  posts: Post[];
  loading: boolean;
  hidePostDropdownAction?: boolean;
  actionsState: PostActionsState;
  onClickActions: (title: string, selectedDetails: Post) => void;
  onPressTag: (data: Post) => void;
  onSelectDropdown: (dropdownData: any, selectedData: Post) => void;
  onLikePost: (post: Post) => void;
  onRefreshPosts: () => void;
  onEndReached?: () => void;
  // Optional scroll props for nested pagination (backward compatible)
  parentScrollMetrics?: {
    contentHeight: number;
    layoutHeight: number;
    scrollY: number;
  };
  isNestedInScrollView?: boolean;

  renderListFooterComponent?: (
    loadingMore?: boolean,
    hasMore?: boolean,
  ) => React.ReactElement | null;
  renderListHeaderComponent?: () => React.ReactElement | null;
  onScroll?: () => void;
  maxHeaderHeight?: number;
}
const SellerProfilePostsList: React.FC<PostsListProps> = memo(
  ({
    posts,
    loading,
    hidePostDropdownAction,
    actionsState,
    onClickActions,
    onPressTag,
    onSelectDropdown,
    onLikePost,
    onRefreshPosts,
    onEndReached,
    parentScrollMetrics,
    isNestedInScrollView = false,
    renderListFooterComponent,
    renderListHeaderComponent,
    onScroll,
    maxHeaderHeight = 0,
  }) => {
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Memoized render function for individual post items
    const renderPostItem = useCallback(
      (props: LegendListRenderItemProps<Post>) => {
        const { item: post, index } = props;

        return (
          <View style={styles.postItem}>
            <PostList
              handleClickActions={onClickActions}
              handlePressTag={onPressTag}
              details={post}
              onSelect={onSelectDropdown}
              loading={loading}
              handleUpdateLikePost={onLikePost}
              likeLoader={actionsState.likeLoader}
              activeLikeId={actionsState.activeLikeId}
              hidePostDropdownAction={hidePostDropdownAction}
              followBtnLoader={actionsState.followBtnLoader}
              followAndUnfollowPostId={actionsState.followAndUnfollowPostId}
              getItems={onRefreshPosts}
            />
          </View>
        );
      },
      [
        loading,
        hidePostDropdownAction,
        actionsState.likeLoader,
        actionsState.activeLikeId,
        actionsState.followBtnLoader,
        actionsState.followAndUnfollowPostId,
        onClickActions,
        onPressTag,
        onSelectDropdown,
        onLikePost,
        onRefreshPosts,
      ],
    );

    // Memoized key extractor for performance - ensure uniqueness
    const keyExtractor = useCallback((item: Post, index: number) => {
      // Create a unique key combining multiple identifiers
      const baseId = item.id || `post-${index}`;
      const timestamp = item.createdOn || Date.now();
      const userId = item.userId || item.sellerId || "";
      const username =
        item.username || item.sellerUsername || item.posterUsername || "";

      // Combine identifiers to ensure uniqueness
      return `${baseId}-${userId}-${username}-${timestamp}-${index}`;
    }, []);

    // Memoized estimated item size for better performance
    const getEstimatedItemSize = useCallback((index: number, item: Post) => {
      // Estimate based on typical post content
      // Posts with images are typically taller
      const baseHeight = 200; // Base height for text content
      const imageHeight = item.defaultImageUrl ? 300 : 0; // Additional height for images
      const marginHeight = 20; // Margin between posts

      return baseHeight + imageHeight + marginHeight;
    }, []);

    return (
      <View style={styles.container}>
        <Animated.FlatList
          data={posts}
          // @ts-ignore
          renderItem={renderPostItem}
          keyExtractor={keyExtractor}
          getEstimatedItemSize={getEstimatedItemSize}
          showsVerticalScrollIndicator={false}
          enableAverages={true}
          recycleItems={false}
          drawDistance={500}
          onEndReached={isNestedInScrollView ? undefined : onEndReached}
          onEndReachedThreshold={isNestedInScrollView ? undefined : 0.5}
          onRefresh={onRefreshPosts}
          refreshing={loading}
          scrollEnabled={!isNestedInScrollView}
          nestedScrollEnabled={isNestedInScrollView}
          waitForInitialLayout={false}
          initialContainerPoolRatio={2}
          accessibilityRole="list"
          accessibilityLabel="Posts list"
          style={styles.listContainer}
          suggestEstimatedItemSize={__DEV__}
          ListFooterComponent={renderListFooterComponent?.(
            loadingMore,
            hasMore,
          )}
          onScroll={onScroll}
          contentContainerStyle={{
            paddingTop: maxHeaderHeight,
            paddingBottom: 50,
          }}
          ListHeaderComponent={renderListHeaderComponent}
        />
        {/*
        <LegendList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={keyExtractor}
          getEstimatedItemSize={getEstimatedItemSize}
          showsVerticalScrollIndicator={false}
          // Performance optimizations
          enableAverages={true}
          recycleItems={false} // Keep false for posts to maintain state
          drawDistance={500} // Render items 500px ahead for smooth scrolling
          // Conditional scroll handling based on nesting
          onEndReached={isNestedInScrollView ? undefined : onEndReached}
          onEndReachedThreshold={isNestedInScrollView ? undefined : 0.5}
          // RefreshControl for pull-to-refresh
          onRefresh={onRefreshPosts}
          refreshing={loading}
          // Nested scrolling optimization
          scrollEnabled={!isNestedInScrollView}
          nestedScrollEnabled={isNestedInScrollView}
          // Additional performance features
          waitForInitialLayout={false} // Don't delay initial render
          initialContainerPoolRatio={2} // Pre-allocate containers for smooth scrolling
          // Accessibility
          accessibilityRole="list"
          accessibilityLabel="Posts list"
          // Styling
          style={styles.listContainer}
          // Debugging (remove in production)
          suggestEstimatedItemSize={__DEV__}
          ListFooterComponent={renderListFooterComponent?.(
            loadingMore,
            hasMore,
          )}
          onScroll={onScroll}
        />
*/}
      </View>
    );
  },
);

SellerProfilePostsList.displayName = "SellerProfilePostsList";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  postItem: {
    marginBottom: 20,
  },
});

export default SellerProfilePostsList;
