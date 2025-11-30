import React, { memo, useCallback } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { LegendList, LegendListRenderItemProps } from "@legendapp/list";
import PostList from "@components/StoryComp/posts";
import { Post } from "@hooks/use-posts-data";
import { PostActionsState } from "@hooks/use-post-actions";
import { useI18n } from "@hooks/use-i18n";

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
  onLoadMore: () => void;
  canLoadMore: boolean;
  // Optional scroll props for nested pagination (backward compatible)
  parentScrollMetrics?: {
    contentHeight: number;
    layoutHeight: number;
    scrollY: number;
  };
  isNestedInScrollView?: boolean;
}
const PostsList: React.FC<PostsListProps> = memo(({
  posts,
  loading,
  hidePostDropdownAction,
  actionsState,
  onClickActions,
  onPressTag,
  onSelectDropdown,
  onLikePost,
  onRefreshPosts,
  onLoadMore,
  canLoadMore,
  parentScrollMetrics,
  isNestedInScrollView = false,
}) => {
  const { t } = useI18n();
  
  // Memoized render function for individual post items
  const renderPostItem = useCallback((props: LegendListRenderItemProps<Post>) => {
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
  }, [
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
  ]);

  // Memoized key extractor for performance - ensure uniqueness
  const keyExtractor = useCallback((item: Post, index: number) => {
    // Create a unique key combining multiple identifiers
    const baseId = item.id || `post-${index}`;
    const timestamp = item.createdOn || Date.now();
    const userId = item.userId || item.sellerId || '';
    const username = item.username || item.sellerUsername || item.posterUsername || '';
    
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
        onEndReached={isNestedInScrollView ? undefined : (canLoadMore ? onLoadMore : undefined)}
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
        accessibilityLabel={t('home.postsList')}
        // Styling
        style={styles.listContainer}
        // Debugging (remove in production)
        suggestEstimatedItemSize={__DEV__}
      />
    </View>
  );
});

PostsList.displayName = "PostsList";

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

export default PostsList;
