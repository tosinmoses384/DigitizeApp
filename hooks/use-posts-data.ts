import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { useToast } from "react-native-toast-notifications";
import timelineServices from "@services/features/timeline-service/timelineServices";
import {
  setFetchMoreItem,
  setIsShownLoginModal,
} from "@redux/slice/profile/profileSlice";
import { PAGINATION_CONFIG } from "@constants/PaginationConfig";

// TypeScript interfaces following the coding guide
export interface Post {
  id: string;
  userId: string;
  username: string;
  userRatings: number;
  userImageUrl: string;
  caption: string;
  defaultImageUrl: string;
  type: string;
  hasTag: boolean;
  likesCount: number;
  commentCount: number;
  isLiked: boolean;
  isEditable: boolean;
  isFollowing: boolean;
  createdOn: string;
  title?: string;
  sellerUsername?: string;
  posterUsername?: string;
  sellerId?: string;
}

export interface PostsState {
  posts: Post[];
  loading: boolean;
  pageToken: string;
  pageItemCount: number;
  hasNextPage: boolean;
  error: string | null;
}

export interface MorePostsState extends Partial<PostsState> {
  hasMore: boolean;
}

export interface UsePostsDataProps {
  activeTab: string;
  filterByCategory?: string;
  sellerId?: string;
  filterByType?: string;
}

export interface UsePostsDataReturn {
  postsState: PostsState;
  morePostsState: MorePostsState;
  getInitialItems: (isDisableLoader?: boolean) => void;
  refreshSilently: () => Promise<void>;
  getMoreItems: () => void;
  updatePostInList: (postId: string, updates: Partial<Post>) => void;
  removePostFromList: (postId: string) => void;
  canLoadMore: boolean;
}

/**
 * Custom hook for managing posts data and pagination
 * Encapsulates all posts-related business logic following section 2.2 of coding guide
 */
export const usePostsData = ({
  activeTab,
  filterByCategory,
  sellerId,
  filterByType,
}: UsePostsDataProps): UsePostsDataReturn => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token, fetchMoreItem, profile } = useAppSelector(
    (state) => state?.userProfileSlice,
  );

  // Get consistent page size from unified configuration
  const pageSize = PAGINATION_CONFIG.CONTENT_TYPES.TIMELINE_POSTS.toString();

  // Abort controller for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Request queue to prevent race conditions
  const requestQueueRef = useRef<Set<string>>(new Set());
  const currentRequestRef = useRef<string | null>(null);

  const [postsState, setPostsState] = useState<PostsState>({
    posts: [],
    loading: false,
    pageToken: "",
    pageItemCount: 0,
    hasNextPage: true,
    error: null,
  });

  const [morePostsState, setMorePostsState] = useState<MorePostsState>({
    loading: false,
    error: null,
    hasMore: false,
  });

  // Memoized function to update a single post in the list
  const updatePostInList = useCallback(
    (postId: string, updates: Partial<Post>) => {
      setPostsState((prevState) => ({
        ...prevState,
        posts: prevState.posts.map((post) =>
          post.id === postId ? { ...post, ...updates } : post,
        ),
      }));
    },
    [],
  );

  // Memoized function to remove a post from the list
  const removePostFromList = useCallback((postId: string) => {
    setPostsState((prevState) => ({
      ...prevState,
      posts: prevState.posts.filter((post) => post.id !== postId),
    }));
  }, []);

  const getMoreItems = useCallback(async () => {
    if (!token || !postsState.hasNextPage) {
      dispatch(setFetchMoreItem(false));
      return;
    }

    const paginationRequestKey = `pagination-${activeTab}-${filterByCategory}-${sellerId}-${filterByType}`;
    if (requestQueueRef.current.has(paginationRequestKey)) {
      return;
    }

    requestQueueRef.current.add(paginationRequestKey);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setMorePostsState((prevState) => ({
      ...prevState,
      loading: true,
      error: null,
    }));

    // Console log for debugging Outfits pagination API call
    if (activeTab === "OutfitPost") {
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      let fullEndpointUrl = `${baseUrl}/timeline/v1/posts?filterByCategory=${filterByCategory || ''}&filterByType=${filterByType || ''}&pageSize=${pageSize}`;
      if (postsState.pageToken) {
        fullEndpointUrl += `&pageToken=${postsState.pageToken}`;
      }
      if (sellerId) {
        fullEndpointUrl += `&userId=${sellerId}`;
      }

    }

    try {
      const response = await timelineServices.getPostQuery(
        token,
        pageSize, // Use consistent page size from config
        postsState.pageToken,
        activeTab || "",
        filterByCategory || "",
        sellerId,
        filterByType,
        abortControllerRef.current.signal,
      );

      dispatch(setFetchMoreItem(false));

      if (response?.responseCode === 401) {
        dispatch(setIsShownLoginModal(true));
        return;
      }

      // Handle different response structures
      const responseData = response?.data?.data || response?.data;
      if (responseData && 'dataset' in responseData && responseData.dataset) {
        const newPosts = responseData.dataset;
        const hasNextPage = responseData.hasNextPage !== false && responseData.pageToken != null;

        setPostsState((prevState) => ({
          ...prevState,
          posts: [...prevState.posts, ...newPosts],
          pageToken: responseData?.pageToken?.toString() || "",
          hasNextPage,
          error: null,
        }));
      } else {
        // No more data available
        setPostsState((prevState) => ({
          ...prevState,
          hasNextPage: false,
          error: null,
        }));
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error in getMoreItems pagination:", error);
        toast?.show("Failed to load more posts", { type: "danger" });
        setMorePostsState((prevState) => ({
          ...prevState,
          loading: false,
          error: "Failed to load more posts",
        }));
      }
      dispatch(setFetchMoreItem(false));
    } finally {
      requestQueueRef.current.delete(paginationRequestKey);
      setMorePostsState((prevState) => ({ ...prevState, loading: false }));
    }
  }, [
    token,
    postsState.pageToken,
    postsState.hasNextPage,
    activeTab,
    filterByCategory,
    sellerId,
    filterByType,
    dispatch,
    toast,
    pageSize,
  ]);

  const getInitialItems = useCallback(
    async (isDisableLoader?: boolean) => {
      const requestId = `${activeTab}-${filterByCategory}-${sellerId}-${filterByType}-${Date.now()}`;
      const similarRequestKey = `${activeTab}-${filterByCategory}-${sellerId}-${filterByType}`;

      // Prevent duplicate parallel requests for the same data
      if (requestQueueRef.current.has(similarRequestKey)) {
        if (__DEV__) {
          console.log('usePostsData: Skipping duplicate initial request:', similarRequestKey);
        }
        return;
      }

      requestQueueRef.current.add(similarRequestKey);
      currentRequestRef.current = requestId;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const shouldShowLoading = !isDisableLoader;

      setPostsState((prevState) => ({
        ...prevState,
        loading: shouldShowLoading,
        pageToken: "",
        error: null,
      }));

      const authToken = token || "";

      // Console log for debugging Outfits API call
      if (activeTab === "OutfitPost") {
        const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
        let fullEndpointUrl = `${baseUrl}/timeline/v1/posts?filterByCategory=${filterByCategory || ''}&filterByType=${filterByType || ''}&pageSize=${pageSize}`;
        if (sellerId) {
          fullEndpointUrl += `&userId=${sellerId}`;
        }
      }

      if (shouldShowLoading) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      try {
        const response = await timelineServices.getPostQuery(
          authToken,
          pageSize, // Use consistent page size from config
          "",
          activeTab || "",
          filterByCategory || "",
          sellerId,
          filterByType,
          abortControllerRef.current.signal,
        );

        if (
          !abortControllerRef.current?.signal.aborted &&
          currentRequestRef.current === requestId
        ) {
          dispatch(setFetchMoreItem(false));

          const responseData = response?.data?.data || response?.data;
          if (responseData && 'dataset' in responseData && responseData.dataset) {
            const hasNextPage = responseData.hasNextPage !== false && responseData.pageToken != null;

            setPostsState((prevState) => ({
              ...prevState,
              loading: false,
              posts: responseData.dataset || [],
              pageItemCount: responseData.dataset?.length || 0,
              pageToken: responseData.pageToken?.toString() || "",
              hasNextPage,
              error: null,
            }));
          } else {
            setPostsState((prevState) => ({
              ...prevState,
              loading: false,
              posts: [],
              pageItemCount: 0,
              pageToken: "",
              hasNextPage: false,
              error: null,
            }));
          }

          if (response?.responseCode === 401) {
            dispatch(setIsShownLoginModal(true));
          }
        } else {
          if (currentRequestRef.current === requestId) {
            setPostsState((prevState) => ({
              ...prevState,
              loading: false,
            }));
          }
        }
      } catch (error: any) {
        if (
          error.name !== "AbortError" &&
          currentRequestRef.current === requestId
        ) {
          console.error("Error in getInitialItems:", error);
          setPostsState((prevState) => ({
            ...prevState,
            loading: false,
            error: "Failed to load initial posts",
          }));
          toast?.show("Failed to load initial posts", { type: "danger" });
        } else {
          if (currentRequestRef.current === requestId) {
            setPostsState((prevState) => ({
              ...prevState,
              loading: false,
            }));
          }
        }
      } finally {
        // Clean up request queue
        requestQueueRef.current.delete(similarRequestKey);
        if (currentRequestRef.current === requestId) {
          currentRequestRef.current = null;
        }
      }
    },
    [
      token,
      activeTab,
      filterByCategory,
      sellerId,
      filterByType,
      dispatch,
      toast,
      pageSize,
    ],
  );

  // Effect to trigger pagination when fetchMoreItem changes
  useEffect(() => {
    if (fetchMoreItem && postsState.hasNextPage) {
      getMoreItems();
    } else if (fetchMoreItem && !postsState.hasNextPage) {
      // Reset fetchMoreItem if there are no more pages
      dispatch(setFetchMoreItem(false));
    }
  }, [fetchMoreItem, getMoreItems, postsState.hasNextPage, dispatch]);

  const refreshSilently = useCallback(async () => {
    await getInitialItems(true);
  }, [getInitialItems]);

  useEffect(() => {
    if (token) {
      getInitialItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, activeTab, filterByCategory, sellerId, filterByType]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      requestQueueRef.current.clear();
      currentRequestRef.current = null;
    };
  }, []);

  const canLoadMore = useMemo(() => {
    return postsState.hasNextPage && !postsState.loading && postsState.posts.length > 0;
  }, [postsState.hasNextPage, postsState.loading, postsState.posts.length]);

  return {
    postsState,
    morePostsState,
    getInitialItems,
    refreshSilently,
    getMoreItems,
    updatePostInList,
    removePostFromList,
    canLoadMore,
  };
};
