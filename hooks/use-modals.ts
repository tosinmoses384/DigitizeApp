import { useCallback, useState } from "react";
import { Post } from "./use-posts-data";

// TypeScript interfaces for modal state management
export interface ModalState {
  isShowCommentModal: boolean;
  isShowLikesModal: boolean;
  isShowTagModal: boolean;
  isShowDeleteModal: boolean;
  isShowShareModal: boolean;
  selectedCommentDetails: Post | null;
  postId: string;
  deletePostId: string;
  postUserId?: string; // Store userId for TagsModal
  postUserImageUrl?: string; // Store userImageUrl for TagsModal
  postUsername?: string; // Store username for TagsModal
}

export interface UseModalsReturn {
  modalState: ModalState;
  openCommentsModal: (post: Post) => void;
  closeCommentsModal: () => void;
  openLikesModal: (post: Post) => void;
  closeLikesModal: () => void;
  openTagModal: (postId: string, userId?: string, userImageUrl?: string, username?: string) => void;
  closeTagModal: () => void;
  openDeleteModal: (postId: string) => void;
  closeDeleteModal: () => void;
  openShareModal: (post: Post) => void;
  closeShareModal: () => void;
}

/**
 * Custom hook for managing modal states
 * Encapsulates all modal-related state logic following section 2.2 of coding guide
 */
export const useModals = (): UseModalsReturn => {
  const [modalState, setModalState] = useState<ModalState>({
    isShowCommentModal: false,
    isShowLikesModal: false,
    isShowTagModal: false,
    isShowDeleteModal: false,
    isShowShareModal: false,
    selectedCommentDetails: null,
    postId: "",
    deletePostId: "",
  });

  // Memoized function to open comments modal
  const openCommentsModal = useCallback((post: Post) => {
    setModalState((prev) => ({
      ...prev,
      isShowCommentModal: true,
      selectedCommentDetails: post,
    }));
  }, []);

  // Memoized function to close comments modal
  const closeCommentsModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isShowCommentModal: false,
      selectedCommentDetails: null,
    }));
  }, []);

  // Memoized function to open likes modal
  const openLikesModal = useCallback((post: Post) => {
    setModalState((prev) => ({
      ...prev,
      isShowLikesModal: true,
      selectedCommentDetails: post,
    }));
  }, []);

  // Memoized function to close likes modal
  const closeLikesModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isShowLikesModal: false,
      selectedCommentDetails: null,
    }));
  }, []);

  // Memoized function to open tag modal
  const openTagModal = useCallback((postId: string, userId?: string, userImageUrl?: string, username?: string) => {
    setModalState((prev) => ({
      ...prev,
      isShowTagModal: true,
      postId,
      postUserId: userId,
      postUserImageUrl: userImageUrl,
      postUsername: username,
    }));
  }, []);

  // Memoized function to close tag modal
  const closeTagModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isShowTagModal: false,
      postId: "",
      postUserId: undefined,
      postUserImageUrl: undefined,
      postUsername: undefined,
    }));
  }, []);

  // Memoized function to open delete modal
  const openDeleteModal = useCallback((postId: string) => {
    setModalState((prev) => ({
      ...prev,
      isShowDeleteModal: true,
      deletePostId: postId,
    }));
  }, []);

  // Memoized function to close delete modal
  const closeDeleteModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isShowDeleteModal: false,
      deletePostId: "",
    }));
  }, []);

  // Memoized function to open share modal
  const openShareModal = useCallback((post: Post) => {
    setModalState((prev) => ({
      ...prev,
      isShowShareModal: true,
      selectedCommentDetails: post,
    }));
  }, []);

  // Memoized function to close share modal
  const closeShareModal = useCallback(() => {
    setModalState((prev) => ({
      ...prev,
      isShowShareModal: false,
      selectedCommentDetails: null,
    }));
  }, []);

  return {
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
  };
};
