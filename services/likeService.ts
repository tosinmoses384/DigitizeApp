import { useToast } from "react-native-toast-notifications";
import { router } from "expo-router";
import timelineServices from "@services/features/timeline-service/timelineServices";
import { setIsShownLoginModal } from "@redux/slice/profile/profileSlice";
import { store } from "@redux/store";

export interface LikeState {
  isLiked: boolean;
  likesCount: number;
}

export interface LikeServiceOptions {
  postId: string;
  currentState: LikeState;
  onStateChange: (postId: string, newState: LikeState) => void;
  toast: any;
}

class LikeService {
  private ongoingRequests = new Set<string>();
  private postStates = new Map<string, LikeState>();

  async toggleLike({
    postId,
    currentState,
    onStateChange,
    toast,
  }: LikeServiceOptions): Promise<void> {
    const { token } = store.getState().userProfileSlice;

    if (!token) {
      store.dispatch(setIsShownLoginModal(true));
      return;
    }

    if (this.ongoingRequests.has(postId)) {
      if (__DEV__) {
        console.log(`[LikeService] Request already in progress for post ${postId}, ignoring duplicate click`);
      }
      return;
    }

    this.ongoingRequests.add(postId);

    const actualCurrentState = this.postStates.get(postId) || currentState;
    const previousState = { ...actualCurrentState };
    const newState: LikeState = {
      isLiked: !previousState.isLiked,
      likesCount: previousState.isLiked 
        ? previousState.likesCount - 1 
        : previousState.likesCount + 1,
    };

    if (__DEV__) {
      console.log(`[LikeService] Starting ${previousState.isLiked ? 'unlike' : 'like'} for post ${postId}`, {
        previousState,
        newState,
        actualCurrentState
      });
    }

    this.postStates.set(postId, newState);
    onStateChange(postId, newState);

    try {
      const response = previousState.isLiked
        ? await timelineServices.unLikePost(token, postId)
        : await timelineServices.likePost(token, postId);

      if (__DEV__) {
        console.log(`[LikeService] API response for post ${postId}:`, {
          responseCode: response?.responseCode,
          status: (response as any)?.status,
          succeeded: (response as any)?.data?.succeeded,
          method: previousState.isLiked ? 'PUT (unlike)' : 'POST (like)'
        });
      }

      if (response?.data?.succeeded || response?.responseCode === "0") {
        if (__DEV__) {
          console.log(`[LikeService] Successfully ${previousState.isLiked ? 'unliked' : 'liked'} post ${postId}`);
        }
        return;
      } 
      
      if (response?.responseCode === "401" || response?.responseCode === 401) {
        this.postStates.set(postId, previousState);
        onStateChange(postId, previousState);
        router.replace("/Onboarding");
        return;
      }
      
      if ((response as any)?.status === 400 || response?.responseCode === "400") {
        const errorDetail = response?.detail || (response as any)?.errors?.model?.[0] || "";
        const errorMessage = errorDetail.toLowerCase();
        
        if (__DEV__) {
          console.log(`[LikeService] 400 error for post ${postId}:`, errorDetail);
        }
        
        if (errorMessage.includes("already liked")) {
          const syncedState: LikeState = {
            isLiked: true,
            likesCount: previousState.isLiked ? previousState.likesCount : previousState.likesCount + 1,
          };
          
          if (__DEV__) {
            console.log(`[LikeService] State desync: Server says already liked, syncing to liked state`);
          }
          
          this.postStates.set(postId, syncedState);
          onStateChange(postId, syncedState);
          return;
        }
        
        if (errorMessage.includes("not liked") || errorMessage.includes("hasn't liked")) {
          const syncedState: LikeState = {
            isLiked: false,
            likesCount: previousState.isLiked ? previousState.likesCount - 1 : previousState.likesCount,
          };
          
          if (__DEV__) {
            console.log(`[LikeService] State desync: Server says not liked, syncing to unliked state`);
          }
          
          this.postStates.set(postId, syncedState);
          onStateChange(postId, syncedState);
          return;
        }
      }
      
      this.postStates.set(postId, previousState);
      onStateChange(postId, previousState);
      toast.show(response?.message || response?.detail || "Failed to update like", {
        type: "danger",
        duration: 3000,
      });
    } catch (error: any) {
      this.postStates.set(postId, previousState);
      onStateChange(postId, previousState);
      
      if (__DEV__) {
        console.error(`[LikeService] Error for post ${postId}:`, error);
      }
      
      toast.show("Failed to update like status", {
        type: "danger",
        duration: 3000,
      });
    } finally {
      this.ongoingRequests.delete(postId);
      
      if (__DEV__) {
        console.log(`[LikeService] Request completed for post ${postId}`);
      }
    }
  }

  isProcessing(postId: string): boolean {
    return this.ongoingRequests.has(postId);
  }

  getCurrentState(postId: string): LikeState | null {
    return this.postStates.get(postId) || null;
  }

  updateState(postId: string, state: LikeState): void {
    this.postStates.set(postId, state);
  }
}

export const likeService = new LikeService();
