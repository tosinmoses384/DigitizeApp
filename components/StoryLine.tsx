import React, { ReactNode, memo, useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { setTagedDetails } from "@redux/slice/outfit-edit-details/outfitEditDetailsSlice";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import { Colors } from "@constants/Colors";
import { useI18n } from "@hooks/use-i18n";

// Import custom hooks following coding guide
import { usePostsData } from "@hooks/use-posts-data";
import { usePostActions } from "@hooks/use-post-actions";
import { useModals } from "@hooks/use-modals";

// Import smaller components following atomic design
import TabNavigation, { Tab } from "./StoryLine/TabNavigation";
import PostsList from "./StoryLine/PostsList";
import ItemsGrid from "./StoryLine/ItemsGrid";
import LoadingState from "./StoryLine/LoadingState";
import EmptyStateContent from "./StoryLine/EmptyStateContent";
import StoriesView from "./StoryComp/Stories";

// Import modal components
import CommentsModal from "../modals/comments/CommentsModal";
import LikesModal from "../modals/LikesModal/LikesModal";
import TagsModal from "../modals/tagsModal/TagsModal";
import DeleteItemModal from "../modals/DeleteItemModal";
import ShareModal from "../modals/ShareModal";

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
    suggestedFilterByType: string
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
  // Optional props to override detail routes (for new API endpoints)
  itemDetailRoute?: string;
  outfitDetailRoute?: string;
  // Hide tab navigation when tabs are managed by parent
  hideTabNavigation?: boolean;
}

const StoryLine: React.FC<StoryLineProps> = memo(
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
    // New flexible control props
    apiConfig,
    onApiConfigChange,
    parameterSource = "internal",
    // Optional detail route overrides
    itemDetailRoute,
    outfitDetailRoute,
    // Hide tab navigation when tabs are managed by parent
    hideTabNavigation = false,
  }) => {
    const { t } = useI18n();
    const dispatch = useAppDispatch();
    const { profile } = useAppSelector((state) => state?.userProfileSlice);

    // Local state for active tab
    const [activeTab, setActiveTab] = React.useState("");

    // Sync internal activeTab state with parent-controlled apiConfig when parameterSource is 'parent'
    React.useEffect(() => {
      if (parameterSource === 'parent' && apiConfig?.activeTab !== undefined) {
        setActiveTab(apiConfig.activeTab);
      }
    }, [parameterSource, apiConfig?.activeTab]);

    // Custom hooks for business logic separation
    const {
      postsState,
      morePostsState,
      getInitialItems,
      refreshSilently,
      getMoreItems,
      updatePostInList,
      removePostFromList,
      canLoadMore,
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

    // Memoized tabs data
    const tabs: Tab[] = useMemo(
      () => [
        { id: "", title: t('home.posts') },
        { id: "ItemPost", title: t('home.items') },
        { id: "OutfitPost", title: t('home.outfits') },
      ],
      [t]
    );

    // Memoized tab press handler
    const handleTabPress = useCallback(
      (tabId: string) => {
        setActiveTab(tabId);

        // Notify parent component about tab change and suggest appropriate filterByType
        if (onActiveTabChange) {
          let suggestedFilterByType = "";

          switch (tabId) {
            case "ItemPost":
              suggestedFilterByType = "ItemPost";
              break;
            case "OutfitPost":
              suggestedFilterByType = "OutfitPost";
              break;
            default:
              // For "Posts" tab or empty, we might want to keep the current filterByType
              // or set it based on the context
              suggestedFilterByType = filterByType || "";
              break;
          }

          onActiveTabChange(tabId, suggestedFilterByType);
        }
      },
      [onActiveTabChange, filterByType]
    );

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
      [dispatch, openCommentsModal, openLikesModal, openShareModal]
    );

    // Memoized press tag handler
    const handlePressTag = useCallback(
      (data: any) => {
        if (data?.id) {
          openTagModal(
            data.id, 
            data?.userId, 
            data?.userImageUrl,
            data?.username || data?.posterUsername || data?.sellerUsername
          );
        }
      },
      [openTagModal]
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
      [handleFollowAndUnfollow, openDeleteModal, openShareModal, dispatch]
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
      refreshSilently();
    }, [closeCommentsModal, refreshSilently]);

    // Memoized scroll handler with throttling
    // Scroll handling is encapsulated in child lists and hooks

    // Edge case: Log when nested scrolling is enabled for debugging
    React.useEffect(() => {
      if (__DEV__ && isNestedInScrollView && parentScrollMetrics) {
        console.log(
          "[StoryLine] Nested scrolling mode enabled with parent metrics:",
          parentScrollMetrics
        );
      }
    }, [isNestedInScrollView, parentScrollMetrics]);

    // Determine if we should show grid or list view
    const isGridView = activeTab === "ItemPost" || activeTab === "OutfitPost";
    const showEmptyState = postsState.posts.length === 0 && !postsState.loading;

    return (
      <View style={[styles.body, { backgroundColor: Colors.light.background }]}>
        {!hideHorizontalStory && <StoriesView />}

        {profile && !hideTabNavigation && (
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabPress={handleTabPress}
            filterByCategory={filterByCategory}
          />
        )}

        {postsState.loading ? (
          <LoadingState
            activeTab={activeTab}
            hideHorizontalStory={hideHorizontalStory}
          />
        ) : showEmptyState ? (
          <EmptyStateContent
            filterByCategory={filterByCategory}
            sellerId={sellerId}
            onRefreshPosts={getInitialItems}
            refreshing={postsState.loading}
          />
        ) : (
          <View
            style={[
              styles.listContainer,
              { paddingHorizontal: hideHorizontalStory ? 0 : 16 },
            ]}
          >
            {isGridView ? (
              <ItemsGrid
                posts={postsState.posts}
                activeTab={activeTab}
                onLikePost={handleLikeAndUnlike}
                onRefreshPosts={getInitialItems}
                onLoadMore={getMoreItems}
                canLoadMore={canLoadMore}
                refreshing={postsState.loading}
                loadingMore={morePostsState.loading}
                itemDetailRoute={itemDetailRoute}
                outfitDetailRoute={outfitDetailRoute}
              />
            ) : (
              <PostsList
                posts={postsState.posts}
                loading={postsState.loading}
                hidePostDropdownAction={hidePostDropdownAction}
                actionsState={actionsState}
                onClickActions={handleClickActions}
                onPressTag={handlePressTag}
                onSelectDropdown={handleSelectDropdown}
                onLikePost={handleLikeAndUnlike}
                onRefreshPosts={getInitialItems}
                onLoadMore={getMoreItems}
                canLoadMore={canLoadMore}
                // Pass scroll props for nested pagination (backward compatible)
                parentScrollMetrics={parentScrollMetrics}
                isNestedInScrollView={isNestedInScrollView}
              />
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
  }
);

StoryLine.displayName = "StoryLine";

export default StoryLine;

const styles = StyleSheet.create({
  body: {
    paddingTop: 16,
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
});
