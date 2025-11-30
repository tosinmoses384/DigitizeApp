import { useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { useToast } from "react-native-toast-notifications";
import { router } from "expo-router";
import timelineServices from "@services/features/timeline-service/timelineServices";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";

export interface LikeState {
  isLiked: boolean;
  likesCount: number;
}

export interface UseLikePostProps {
  postId: string;
  initialLikeState: LikeState;
  onStateChange?: (postId: string, newState: LikeState) => void;
}

export interface UseLikePostReturn {
  likeState: LikeState;
  isProcessing: boolean;
  toggleLike: () => void;
}

/**
 * Reusable hook for managing post like/unlike functionality
 * Handles optimistic updates, race conditions, and state synchronization
 * Following coding guide sections 2.2 (business logic in hooks) and 7 (performance)
 */
export const useLikePost = ({
  postId,
  initialLikeState,
  onStateChange,
}: UseLikePostProps): UseLikePostReturn => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state?.userProfileSlice);

  const currentStateRef = useRef<LikeState>(initialLikeState);
  const ongoingRequestRef = useRef<boolean>(false);

  const updateState = useCallback((newState: LikeState) => {
    currentStateRef.current = newState;
    onStateChange?.(postId, newState);
  }, [postId, onStateChange]);

  const toggleLike = useCallback(async () => {
    if (!token) {
      dispatch(setIsShownLoginModal(true));
      return;
    }

    if (ongoingRequestRef.current) {
      if (__DEV__) {
        console.log(`[useLikePost] Request already in progress for post ${postId}, ignoring duplicate click`);
      }
      return;
    }

    ongoingRequestRef.current = true;

    const previousState = { ...currentStateRef.current };
    const newState: LikeState = {
      isLiked: !previousState.isLiked,
      likesCount: previousState.isLiked 
        ? previousState.likesCount - 1 
        : previousState.likesCount + 1,
    };

    if (__DEV__) {
      console.log(`[useLikePost] Starting ${previousState.isLiked ? 'unlike' : 'like'} for post ${postId}`, {
        previousState,
        newState
      });
    }

    updateState(newState);

    try {
      const response = previousState.isLiked
        ? await timelineServices.unLikePost(token, postId)
        : await timelineServices.likePost(token, postId);

      if (__DEV__) {
        console.log(`[useLikePost] API response for post ${postId}:`, {
          responseCode: response?.responseCode,
          status: (response as any)?.status,
          succeeded: (response as any)?.data?.succeeded
        });
      }

      if (response?.data?.succeeded || response?.responseCode === "0") {
        if (__DEV__) {
          console.log(`[useLikePost] Successfully ${previousState.isLiked ? 'unliked' : 'liked'} post ${postId}`);
        }
        return;
      } 
      
      if (response?.responseCode === "401" || response?.responseCode === 401) {
        updateState(previousState);
        router.replace("/Onboarding");
        return;
      }
      
      if ((response as any)?.status === 400 || response?.responseCode === "400") {
        const errorDetail = response?.detail || (response as any)?.errors?.model?.[0] || "";
        const errorMessage = errorDetail.toLowerCase();
        
        if (__DEV__) {
          console.log(`[useLikePost] 400 error for post ${postId}:`, errorDetail);
        }
        
        if (errorMessage.includes("already liked")) {
          const syncedState: LikeState = {
            isLiked: true,
            likesCount: previousState.isLiked ? previousState.likesCount : previousState.likesCount + 1,
          };
          
          if (__DEV__) {
            console.log(`[useLikePost] State desync: Server says already liked, syncing to liked state`);
          }
          
          updateState(syncedState);
          return;
        }
        
        if (errorMessage.includes("not liked") || errorMessage.includes("hasn't liked")) {
          const syncedState: LikeState = {
            isLiked: false,
            likesCount: previousState.isLiked ? previousState.likesCount - 1 : previousState.likesCount,
          };
          
          if (__DEV__) {
            console.log(`[useLikePost] State desync: Server says not liked, syncing to unliked state`);
          }
          
          updateState(syncedState);
          return;
        }
      }
      
      updateState(previousState);
      toast.show(response?.message || response?.detail || "Failed to update like", {
        type: "danger",
        duration: 3000,
      });
    } catch (error: any) {
      updateState(previousState);
      
      if (__DEV__) {
        console.error(`[useLikePost] Error for post ${postId}:`, error);
      }
      
      toast.show("Failed to update like status", {
        type: "danger",
        duration: 3000,
      });
    } finally {
      ongoingRequestRef.current = false;
      
      if (__DEV__) {
        console.log(`[useLikePost] Request completed for post ${postId}`);
      }
    }
  }, [token, dispatch, postId, updateState, toast]);

  return {
    likeState: currentStateRef.current,
    isProcessing: ongoingRequestRef.current,
    toggleLike,
  };
};
