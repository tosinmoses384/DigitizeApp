import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { useToast } from "react-native-toast-notifications";
import { router } from "expo-router";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import timelineServices from "@services/features/timeline-service/timelineServices";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import { Post } from "./use-posts-data";
import { likeService, LikeState } from "@services/likeService";

export interface UsePostActionsProps {
  updatePostInList: (postId: string, updates: Partial<Post>) => void;
  removePostFromList: (postId: string) => void;
  refreshPosts: () => void;
}

export interface PostActionsState {
  likeLoader: boolean;
  activeLikeId: string;
  followBtnLoader: boolean;
  followAndUnfollowPostId: string;
  deleteLoader: boolean;
}

export interface UsePostActionsReturn {
  actionsState: PostActionsState;
  handleLikeAndUnlike: (selectedData: Post) => Promise<void>;
  handleFollowAndUnfollow: (selectedData: Post, title: string) => Promise<void>;
  handleDeletePost: (postId: string) => Promise<void>;
}

/**
 * Custom hook for managing post actions (like, follow, delete)
 * Encapsulates all post interaction business logic following section 2.2 of coding guide
 */
export const usePostActions = ({
  updatePostInList,
  removePostFromList,
  refreshPosts,
}: UsePostActionsProps): UsePostActionsReturn => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state?.userProfileSlice);

  const [actionsState, setActionsState] = useState<PostActionsState>({
    likeLoader: false,
    activeLikeId: "",
    followBtnLoader: false,
    followAndUnfollowPostId: "",
    deleteLoader: false,
  });

  const handleLikeStateChange = useCallback((postId: string, newState: LikeState) => {
    updatePostInList(postId, {
      isLiked: newState.isLiked,
      likesCount: newState.likesCount,
    });
  }, [updatePostInList]);

  const handleLikeAndUnlike = useCallback(
    async (selectedData: Post) => {
      // Initialize service state
      const currentState = {
        isLiked: selectedData.isLiked,
        likesCount: selectedData.likesCount,
      };
      likeService.updateState(selectedData.id, currentState);
      
      await likeService.toggleLike({
        postId: selectedData.id,
        currentState,
        onStateChange: handleLikeStateChange,
        toast,
      });
    },
    [handleLikeStateChange, toast]
  );

  // Memoized function to handle follow/unfollow actions
  const handleFollowAndUnfollow = useCallback(
    async (selectedData: Post, title: string) => {
      if (!token) {
        dispatch(setIsShownLoginModal(true));
        return;
      }

      setActionsState((prev) => ({
        ...prev,
        followBtnLoader: true,
        followAndUnfollowPostId: selectedData.id,
      }));

      const data = {
        brandId: selectedData.userId,
      };

      try {
        const response = selectedData.isFollowing
          ? await wardrobeServices.unfollowTrifters(data, token)
          : await wardrobeServices.followTrifters(data, token);

        if (response?.status === 200) {
          // Update the post in the list with new follow status
          updatePostInList(selectedData.id, {
            isFollowing: !selectedData.isFollowing,
          });
        } else if (response?.responseCode === "401" || response?.responseCode === 401) {
          router.push("/Onboarding");
        } else {
          toast.show("Failed to update follow status", {
            type: "danger",
            duration: 4000,
          });
        }
      } catch (error: any) {
        console.error("Error in handleFollowAndUnfollow:", error);
        toast.show("Failed to update follow status", {
          type: "danger",
          duration: 4000,
        });
      } finally {
        setActionsState((prev) => ({
          ...prev,
          followBtnLoader: false,
          followAndUnfollowPostId: "",
        }));
      }
    },
    [token, dispatch, updatePostInList, toast]
  );

  // Memoized function to handle post deletion
  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!token) {
        dispatch(setIsShownLoginModal(true));
        return;
      }

      setActionsState((prev) => ({
        ...prev,
        deleteLoader: true,
      }));

      try {
        const response = await timelineServices.deletePost(token, postId);

        if (response?.status === 200) {
          // Remove the post from the list
          removePostFromList(postId);
          // Refresh the posts list
          refreshPosts();
        } else if (response?.responseCode === "401" || response?.responseCode === 401) {
          router.push("/Onboarding");
        } else {
          toast.show(`${response?.message || response?.detail}`, {
            type: "danger",
            duration: 4000,
          });
        }
      } catch (error: any) {
        console.error("Error in handleDeletePost:", error);
        toast.show("An error occurred. Please try again later.", {
          type: "danger",
          duration: 4000,
        });
      } finally {
        setActionsState((prev) => ({
          ...prev,
          deleteLoader: false,
        }));
      }
    },
    [token, dispatch, removePostFromList, refreshPosts, toast]
  );

  return {
    actionsState,
    handleLikeAndUnlike,
    handleFollowAndUnfollow,
    handleDeletePost,
  };
};
