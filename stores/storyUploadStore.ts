import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UploadedImageData {
  requestId: string;
  uri: string;
  mimeType: string;
  uploadedAt: number;
  contentType: string;
}

interface StoryUploadState {
  uploadedImages: Map<string, UploadedImageData>;
  currentUpload: {
    requestId: string | null;
    imageUri: string | null;
    isImageUploaded: boolean;
    isStoryCreating: boolean;
    error: string | null;
    retryCount: number;
  } | null;
  isUploading: boolean;
  lastStoryRefreshTrigger: number;
  storyRefreshDelay: number;
}

interface StoryUploadActions {
  setImageUploaded: (requestId: string, uri: string, mimeType: string, contentType: string) => void;
  setStoryCreating: (requestId: string, imageUri: string) => void;
  setStoryCreated: (requestId: string) => void;
  setUploadError: (error: string) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
  clearCurrentUpload: () => void;
  isImageAlreadyUploaded: (uri: string) => UploadedImageData | null;
  cleanupOldUploads: (maxAgeMs?: number) => void;
  resetStore: () => void;
  triggerStoryRefresh: () => void;
  getLastStoryRefreshTrigger: () => number;
  setStoryRefreshDelay: (delay: number) => void;
  getStoryRefreshDelay: () => number;
}

type StoryUploadStore = StoryUploadState & StoryUploadActions;

const initialState: StoryUploadState = {
  uploadedImages: new Map(),
  currentUpload: null,
  isUploading: false,
  lastStoryRefreshTrigger: 0,
  storyRefreshDelay: 2000, // Default 2 second delay
};

const MAX_RETRY_COUNT = 3;
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const useStoryUploadStore = create<StoryUploadStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setImageUploaded: (requestId: string, uri: string, mimeType: string, contentType: string) => {
          set((state) => {
            const newUploadedImages = new Map(state.uploadedImages);
            newUploadedImages.set(uri, {
              requestId,
              uri,
              mimeType,
              contentType,
              uploadedAt: Date.now(),
            });

            return {
              uploadedImages: newUploadedImages,
              currentUpload: {
                requestId,
                imageUri: uri,
                isImageUploaded: true,
                isStoryCreating: false,
                error: null,
                retryCount: state.currentUpload?.retryCount || 0,
              },
              isUploading: true,
            };
          }, false, 'setImageUploaded');
        },

        setStoryCreating: (requestId: string, imageUri: string) => {
          set((state) => ({
            currentUpload: {
              requestId,
              imageUri,
              isImageUploaded: state.currentUpload?.isImageUploaded || false,
              isStoryCreating: true,
              error: null,
              retryCount: state.currentUpload?.retryCount || 0,
            },
            isUploading: true,
          }), false, 'setStoryCreating');
        },

        setStoryCreated: (requestId: string) => {
          set((state) => {
            const newUploadedImages = new Map(state.uploadedImages);
            if (state.currentUpload?.imageUri) {
              newUploadedImages.delete(state.currentUpload.imageUri);
            }

            return {
              uploadedImages: newUploadedImages,
              currentUpload: null,
              isUploading: false,
              lastStoryRefreshTrigger: Date.now(),
            };
          }, false, 'setStoryCreated');
        },

        setUploadError: (error: string) => {
          set((state) => ({
            currentUpload: state.currentUpload ? {
              ...state.currentUpload,
              error,
              isStoryCreating: false,
            } : null,
            isUploading: false,
          }), false, 'setUploadError');
        },

        incrementRetryCount: () => {
          set((state) => ({
            currentUpload: state.currentUpload ? {
              ...state.currentUpload,
              retryCount: state.currentUpload.retryCount + 1,
            } : null,
          }), false, 'incrementRetryCount');
        },

        resetRetryCount: () => {
          set((state) => ({
            currentUpload: state.currentUpload ? {
              ...state.currentUpload,
              retryCount: 0,
            } : null,
          }), false, 'resetRetryCount');
        },

        clearCurrentUpload: () => {
          set({
            currentUpload: null,
            isUploading: false,
          }, false, 'clearCurrentUpload');
        },

        isImageAlreadyUploaded: (uri: string) => {
          const uploadedImage = get().uploadedImages.get(uri);
          if (uploadedImage) {
            const ageMs = Date.now() - uploadedImage.uploadedAt;
            if (ageMs < DEFAULT_MAX_AGE_MS) {
              return uploadedImage;
            }
          }
          return null;
        },

        cleanupOldUploads: (maxAgeMs = DEFAULT_MAX_AGE_MS) => {
          set((state) => {
            const newUploadedImages = new Map(state.uploadedImages);
            const now = Date.now();
            
            for (const [uri, data] of newUploadedImages.entries()) {
              if (now - data.uploadedAt > maxAgeMs) {
                newUploadedImages.delete(uri);
              }
            }

            return {
              uploadedImages: newUploadedImages,
            };
          }, false, 'cleanupOldUploads');
        },

        resetStore: () => {
          set(initialState, false, 'resetStore');
        },

        triggerStoryRefresh: () => {
          set((state) => ({
            lastStoryRefreshTrigger: Date.now(),
          }), false, 'triggerStoryRefresh');
        },

        getLastStoryRefreshTrigger: () => {
          return get().lastStoryRefreshTrigger;
        },

        setStoryRefreshDelay: (delay: number) => {
          set((state) => ({
            storyRefreshDelay: delay,
          }), false, 'setStoryRefreshDelay');
        },

        getStoryRefreshDelay: () => {
          return get().storyRefreshDelay;
        },
      }),
      {
        name: 'story-upload-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          uploadedImages: Array.from(state.uploadedImages.entries()),
        }),
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.uploadedImages)) {
            state.uploadedImages = new Map(state.uploadedImages as any);
          }
        },
      }
    ),
    {
      name: 'StoryUploadStore',
    }
  )
);
