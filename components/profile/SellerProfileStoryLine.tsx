import React, { memo, ReactNode, useCallback, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAppDispatch } from "@redux/store";
import { setTagedDetails } from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import { Colors } from "@constants/Colors";

// Import custom hooks following coding guide
import { usePostsData } from "@hooks/use-posts-data";
import { usePostActions } from "@hooks/use-post-actions";
import { useModals } from "@hooks/use-modals";

// Import smaller components following atomic design
import LoadingState from "../StoryLine/LoadingState";
import EmptyStateContent from "../StoryLine/EmptyStateContent";
import StoriesView from "../StoryComp/Stories";

// Import modal components
import CommentsModal from "../../modals/comments/CommentsModal";
import LikesModal from "../../modals/LikesModal/LikesModal";
import TagsModal from "../../modals/tagsModal/TagsModal";
import DeleteItemModal from "../../modals/DeleteItemModal";
import ShareModal from "../../modals/ShareModal";
import { ThemedText } from "@components/ThemedText";
import SellerProfileItemsGrid from "@components/profile/SellerProfileItemsGrid";
import SellerProfilePostsList from "@components/profile/SellerProfilePostsList";

// API Configuration interface for flexible parameter control
export interface StoryLineApiConfig {
  // Core API parameters
  activeTab?: string;
  filterByCategory?: string;
  sellerId?: string;
  filterByType?: string;

  // Dynamic parameters
  pageSize?: string;
  customFilters?: Record<string, any>;

  // Parameter transformation
  transformParams?: (params: any) => any;

  // Context metadata
  context?: "home" | "profile" | "category" | "search";
}

// TypeScript interface for component props following coding guide section 3
export interface StoryLineProps {
  header?: ReactNode;
  hideHorizontalStory?: boolean;
  filterByCategory?: string;
  sellerId?: string;
  hidePostDropdownAction?: boolean;
  filterByType?: string;
  onActiveTabChange?: (
    activeTab: string,
    suggestedFilterByType: string,
  ) => void;
  // Optional scroll props for nested pagination (backward compatible)
  parentScrollMetrics?: {
    contentHeight: number;
    layoutHeight: number;
    scrollY: number;
  };
  isNestedInScrollView?: boolean;

  // New flexible control props
  apiConfig?: StoryLineApiConfig;
  onApiConfigChange?: (config: StoryLineApiConfig) => void;
  parameterSource?: "parent" | "internal";

  onScroll?: () => void;
  maxHeaderHeight?: number;
  activeTab?: string;
}

const SellerProfileStoryLine: React.FC<StoryLineProps> = memo(
  ({
    header,
    hideHorizontalStory,
    filterByCategory,
    sellerId,
    hidePostDropdownAction,
    filterByType,
    onActiveTabChange,
    parentScrollMetrics,
    isNestedInScrollView = false,
    apiConfig,
    onApiConfigChange,
    parameterSource = "internal",
    onScroll,
    maxHeaderHeight,
    ...props
  }) => {
    const dispatch = useAppDispatch();

    // Local state for active tab
    const [activeTab, setActiveTab] = React.useState("");

    // Custom hooks for business logic separation
    const {
      postsState,
      getInitialItems,
      updatePostInList,
      removePostFromList,
      getMoreItems,
      morePostsState,
    } = usePostsData({
      activeTab,
      filterByCategory: filterByCategory || apiConfig?.filterByCategory,
      sellerId,
      filterByType: filterByType || apiConfig?.filterByType,
    });

    const {
      actionsState,
      handleLikeAndUnlike,
      handleFollowAndUnfollow,
      handleDeletePost,
    } = usePostActions({
      updatePostInList,
      removePostFromList,
      refreshPosts: getInitialItems,
    });

    const {
      modalState,
      openCommentsModal,
      closeCommentsModal,
      openLikesModal,
      closeLikesModal,
      openTagModal,
      closeTagModal,
      openDeleteModal,
      closeDeleteModal,
      openShareModal,
      closeShareModal,
    } = useModals();

    // Memoized click actions handler
    const handleClickActions = useCallback(
      (title: string, selectedDetails: any) => {
        if (!selectedDetails?.id) {
          dispatch(setIsShownLoginModal(true));
          return;
        }

        switch (title) {
          case "comment":
            openCommentsModal(selectedDetails);
            break;
          case "like":
            openLikesModal(selectedDetails);
            break;
          case "share":
            openShareModal(selectedDetails);
            break;
          default:
            break;
        }
      },
      [dispatch, openCommentsModal, openLikesModal, openShareModal],
    );

    // Memoized press tag handler
    const handlePressTag = useCallback(
      (data: any) => {
        if (data?.id) {
          openTagModal(data.id, data?.userId, data?.userImageUrl);
        }
      },
      [openTagModal],
    );

    // Memoized dropdown selection handler
    const handleSelectDropdown = useCallback(
      (dropdownData: any, selectedData: any) => {
        if (
          dropdownData?.title === "Unfollow" ||
          dropdownData?.title === "Follow"
        ) {
          handleFollowAndUnfollow(selectedData, dropdownData.title);
        } else if (dropdownData?.title === "Delete post") {
          openDeleteModal(selectedData.id);
        } else if (dropdownData?.title === "Edit post") {
          dispatch(setTagedDetails(null));
          // router.push(`/editPost/${selectedData?.id}`);
        } else if (dropdownData?.title === "Share Post") {
          openShareModal(selectedData);
        }
      },
      [handleFollowAndUnfollow, openDeleteModal, openShareModal, dispatch],
    );

    // Memoized delete handler
    const handleDelete = useCallback(async () => {
      if (modalState.deletePostId) {
        await handleDeletePost(modalState.deletePostId);
        closeDeleteModal();
      }
    }, [modalState.deletePostId, handleDeletePost, closeDeleteModal]);

    // Memoized comments modal close handler
    const handleCloseCommentsModal = useCallback(() => {
      closeCommentsModal();
      getInitialItems(true);
    }, [closeCommentsModal, getInitialItems]);

    // Memoized footer component renderer
    const renderListFooterComponent = useCallback(() => {
      if (morePostsState.loading) {
        return (
          <View style={[styles.listFooter]}>
            <ActivityIndicator />
          </View>
        );
      } else if (morePostsState.error) {
        return (
          <View style={[styles.listFooter]}>
            <ThemedText style={{ color: Colors.light.secondaryText }}>
              Error loading more items.
            </ThemedText>
          </View>
        );
      }
      return null;
    }, [morePostsState]);

    // Edge case: Log when nested scrolling is enabled for debugging
    React.useEffect(() => {
      if (__DEV__ && isNestedInScrollView && parentScrollMetrics) {
        console.log(
          "[StoryLine] Nested scrolling mode enabled with parent metrics:",
          parentScrollMetrics,
        );
      }
    }, [isNestedInScrollView, parentScrollMetrics]);

    // Determine if we should show grid or list view
    const isGridView = activeTab === "ItemPost" || activeTab === "OutfitPost";
    const showEmptyState = postsState.posts.length === 0 && !postsState.loading;

    useEffect(() => {
      if (props.activeTab !== null && props.activeTab !== undefined) {
        setActiveTab(props.activeTab);
      }
    }, [props.activeTab]);

    return (
      <View style={[styles.body, { backgroundColor: Colors.light.background }]}>
        {!hideHorizontalStory && <StoriesView />}

        {/*
        {profile && (
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={handleTabPress}
            filterByCategory={filterByCategory}
          />
        )}
*/}

        {postsState.loading ? (
          <LoadingState
            activeTab={activeTab}
            hideHorizontalStory={hideHorizontalStory}
            maxHeaderHeight={maxHeaderHeight}
          />
        ) : showEmptyState ? (
          <>
            <EmptyStateContent
              filterByCategory={filterByCategory}
              sellerId={sellerId}
              onRefreshPosts={getInitialItems}
              maxHeaderHeight={maxHeaderHeight}
            />
          </>
        ) : (
          <View
            style={[
              styles.listContainer,
              { paddingHorizontal: hideHorizontalStory ? 0 : 16 },
            ]}
          >
            {isGridView ? (
              <>
                <SellerProfileItemsGrid
                  posts={postsState.posts}
                  activeTab={activeTab}
                  onLikePost={handleLikeAndUnlike}
                  onRefreshPosts={getInitialItems}
                  refreshing={postsState.loading}
                  onEndReached={getMoreItems}
                  renderListFooterComponent={renderListFooterComponent}
                  onScroll={onScroll}
                  maxHeaderHeight={maxHeaderHeight}
                />
              </>
            ) : (
              <>
                <SellerProfilePostsList
                  posts={postsState.posts}
                  loading={postsState.loading}
                  hidePostDropdownAction={hidePostDropdownAction}
                  actionsState={actionsState}
                  onClickActions={handleClickActions}
                  onPressTag={handlePressTag}
                  onSelectDropdown={handleSelectDropdown}
                  onLikePost={handleLikeAndUnlike}
                  onRefreshPosts={getInitialItems}
                  parentScrollMetrics={parentScrollMetrics}
                  isNestedInScrollView={isNestedInScrollView}
                  onEndReached={getMoreItems}
                  renderListFooterComponent={renderListFooterComponent}
                  onScroll={onScroll}
                  maxHeaderHeight={maxHeaderHeight}
                />
              </>
            )}
          </View>
        )}

        {/* Modal Components */}
        {modalState.isShowCommentModal && modalState.selectedCommentDetails && (
          <CommentsModal
            isShow={modalState.isShowCommentModal}
            selectedCommentDetails={modalState.selectedCommentDetails}
            onClose={handleCloseCommentsModal}
            refetch={() => {}}
          />
        )}

        {modalState.isShowLikesModal && (
          <LikesModal
            isShow={modalState.isShowLikesModal}
            onClose={closeLikesModal}
            selectedLikeDetails={modalState.selectedCommentDetails}
          />
        )}

        {modalState.isShowTagModal && modalState.postId && (
          <TagsModal
            isShow={modalState.isShowTagModal}
            onClose={closeTagModal}
            contentId={modalState.postId}
            contentType="post"
            userId={modalState.postUserId}
            userImageUrl={modalState.postUserImageUrl}
            username={modalState.postUsername}
          />
        )}

        {modalState.isShowDeleteModal && modalState.deletePostId && (
          <DeleteItemModal
            onClose={closeDeleteModal}
            handleDelete={handleDelete}
            loader={actionsState.deleteLoader}
          />
        )}

        {modalState.isShowShareModal && (
          <ShareModal
            onClose={closeShareModal}
            isShow={modalState.isShowShareModal}
            postData={modalState.selectedCommentDetails}
            shareType="post"
          />
        )}
      </View>
    );
  },
);

SellerProfileStoryLine.displayName = "SellerProfileStoryLine";

export default SellerProfileStoryLine;

const styles = StyleSheet.create({
  body: {
    paddingTop: 16,
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    flex: 1,
  },
  listFooter: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
