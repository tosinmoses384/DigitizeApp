import React, { memo } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import PostList from "@components/StoryComp/posts";
import SkeletonLoader from "@components/Skeleton";
import GridSkeleton from "@components/GridSkeleton";
import { Colors } from "@constants/Colors";

// Props interface following coding guide section 3
export interface LoadingStateProps {
  activeTab: string;
  hideHorizontalStory?: boolean;
  maxHeaderHeight?: number;
}

/**
 * Stateless component for rendering loading states
 * Following atomic design principles from section 3 of coding guide
 */
const LoadingState: React.FC<LoadingStateProps> = memo(({
  activeTab,
  hideHorizontalStory,
  maxHeaderHeight = 0,
}) => {
  // Mock posts data for skeleton loading
  const mockPosts = [
    { id: 1, title: "" },
    { id: 2, title: "" },
    { id: 3, title: "" },
    { id: 4, title: "" },
  ];

  const isGridView = activeTab === "ItemPost" || activeTab === "OutfitPost";

  // Debug logging for loading state rendering
  React.useEffect(() => {
    if (__DEV__) {
      console.log('[LoadingState] Rendering loading state:', { activeTab, isGridView, hideHorizontalStory });
    }
  }, [activeTab, isGridView, hideHorizontalStory]);

  return (
    <View style={[styles.container, { 
      padding: hideHorizontalStory ? 0 : 16,
      paddingTop: maxHeaderHeight 
    }]}>
      <View style={styles.loadingIndicator}>
        <ActivityIndicator 
          size="small" 
          color={Colors.light.primaryBase} 
          style={styles.spinner}
        />
      </View>
      
      {isGridView ? (
        <GridSkeleton />
      ) : (
        mockPosts.map((emptyPost, index) => (
          <PostList
            key={index}
            handleClickActions={() => {}}
            handlePressTag={() => {}}
            details={[]}
            onSelect={() => {}}
            loading={true}
            handleUpdateLikePost={() => {}}
            getItems={() => {}}
          />
        ))
      )}
    </View>
  );
});

LoadingState.displayName = "LoadingState";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  spinner: {
    marginRight: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.secondaryText,
    fontWeight: '500',
  },
});

export default LoadingState;
