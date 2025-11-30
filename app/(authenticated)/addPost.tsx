import WardrobeAndOutfits from '@components/wardrobeAndOutffit';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ImageIcon from '../../assets/images/svg/camera-icon-red.svg';
import { router } from 'expo-router';
import { useAppDispatch } from '@redux/store';
import { setNewPostDetails } from '@redux/slice/outfit-edit-details/outfitEditDetailsSlice';
import { useOptimizedImagePicker } from '@hooks/useOptimizedImagePicker';

interface MediaData {
  imageUri: string;
  type: string;
  originalFileSize: number;
  fileSize: number;
  compressionRatio: number;
  mimeType?: string;
  fileName?: string;
}

const AddPost = () => {
  const dispatch = useAppDispatch();
  const [images, setImages] = useState<any[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<MediaData[]>([]);
  const [failedMedia, setFailedMedia] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadStatusModalVisible, setIsUploadStatusModalVisible] =
    useState(false);
  const [localError, setLocalError] = useState<any>(null);

  const handleCloseUploadStatusModal = useCallback(() => {
    setIsUploadStatusModalVisible(false);
    setUploadedMedia([]);

    // Navigate back to home page
    router.back();
  }, []);

  const clearLocalError = useCallback(() => {
    setLocalError(null);
  }, []);

  const {
    pickImageFromGallery,
    isProcessing,
    processingProgress,
    error: pickerError,
    clearError: clearPickerError,
    cancelProcessing,
  } = useOptimizedImagePicker({
    maxFileSize: 1.9 * 1024 * 1024,
    maxResolution: null,
    quality: 0.9,
    format: 'auto',
    enableCropping: false,
    enableProgressTracking: true,
    enablePerformanceMonitoring: true,
    enableAdvancedRecovery: true,
    processing: {
      enableProgressiveJPEG: true,
      preserveTransparency: true,
      stripMetadata: true,
      enableSmartCropping: false,
      compressionAlgorithm: 'balanced',
      enableEnhancement: false,
      enableBackgroundRemoval: false,
    },
    backgroundRemoval: {
      trim: true,
      timeout: 30000,
      enableDeviceCheck: true,
    },
    performance: {
      enableMonitoring: true,
      enableAlerts: true,
      memoryThreshold: 100 * 1024 * 1024,
      processingTimeThreshold: 15000,
    },
    fallback: {
      enableFallbackCompression: true,
      fallbackQuality: 0.6,
      maxRetryAttempts: null,
      enableParameterAdjustment: true,
      timeoutMs: 30000,
    },
  });

  const handleAddFromGallery = useCallback(async () => {
    try {
      clearLocalError();
      clearPickerError();

      // Check storage space before processing
      const { safeImageManipulator } = await import('@hooks/useOptimizedImagePicker/utils/safeImageManipulatorWrapper');
      const storageCheck = await safeImageManipulator.checkStorageSpace();

      if (!storageCheck.available) {
        throw new Error(`Storage issue: ${storageCheck.message}`);
      }

      const result = await pickImageFromGallery(
        {
          mediaTypes: 'images',
          allowsEditing: false,
          quality: 0.9,
        },
        {
          processing: {
            enableProgressiveJPEG: true,
            preserveTransparency: true,
            stripMetadata: true,
            enableSmartCropping: true,
            compressionAlgorithm: 'high_quality',
            enableEnhancement: false,
            enableBackgroundRemoval: false, // Disable background removal to reduce processing load
          },
        },
      );

      const mediaData = {
        imageUri: result.uri,
        type: `image/${result.format}`,
        originalFileSize: result.originalFileSize,
        fileSize: result.fileSize,
        compressionRatio: result.compressionRatio,
        fileName: (result as any).fileName,
      };

      setImages([mediaData]);
      setUploadedMedia([mediaData]);
    } catch (error: any) {
      console.error('handleAddFromGallery error:', error);

      // Provide user-friendly error messages
      let userMessage = 'Failed to process image from gallery';

      if (error.message?.includes('saveAsync') || error.message?.includes('save')) {
        userMessage = 'Image processing failed due to storage issues. Please try again or select a different image.';
      } else if (error.message?.includes('permission')) {
        userMessage = 'Permission denied. Please check app permissions for photo library access.';
      } else if (error.message?.includes('storage') || error.message?.includes('space')) {
        userMessage = 'Insufficient storage space. Please free up some space and try again.';
      } else if (error.message?.includes('canceled')) {
        userMessage = 'Image selection was canceled.';
        return; // Don't show error for user cancellation
      }

      // Set error state for UI display
      setLocalError({
        message: userMessage,
        code: 'IMAGE_PROCESSING_FAILED',
        category: 'processing',
        severity: 'medium',
        retryable: true,
        recoverySuggestions: [
          'Try selecting a different image',
          'Check available storage space',
          'Restart the app and try again'
        ]
      });
    }
  }, [pickImageFromGallery, clearLocalError, clearPickerError]);

  useEffect(() => {
    if (images?.length) {
      dispatch(setNewPostDetails(images));
      router.push('/newPost');
    }
  }, [images]);

  return (
    <WardrobeAndOutfits
      type={'Create Post'}
      uploadComponent={
        <>
          <Pressable
            style={({ pressed }) => [
              styles.uploadView,
              pressed && styles.pressed,
            ]}
            onPress={handleAddFromGallery}
            // onPress={pickImage}
          >
            <ImageIcon />
            <Text style={styles.uploadText}>Add from gallery</Text>
          </Pressable>

          {/* Progress Indicator */}
          <View style={[styles.progressWrapper]}>
            {isProcessing && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${processingProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {processingProgress.toFixed(0)}% - Processing your media...
                </Text>
              </View>
            )}

            {/* Error Display */}
            {(localError || pickerError) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {localError?.message || pickerError?.message || 'An error occurred'}
                </Text>
                <Text style={styles.errorSuggestions}>
                  {localError?.recoverySuggestions?.join(', ') || pickerError?.recoverySuggestions?.join(', ') || 'Please try again'}
                </Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={() => {
                    clearLocalError();
                    clearPickerError();
                    handleAddFromGallery();
                  }}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </Pressable>
              </View>
            )}
          </View>
        </>
      }
    />
  );
};

export default AddPost;

const styles = StyleSheet.create({
  uploadView: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FF5C68',
    padding: 21,
    borderRadius: 8,
    backgroundColor: '#FFF7F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginLeft: 16,
    color: '#D4313E',
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
  },
  pressed: {
    opacity: 0.5,
  },
  progressWrapper: {
    paddingHorizontal: 16,
  },
  progressContainer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'DMSans',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontFamily: 'DMSans',
    fontWeight: '600',
    marginBottom: 4,
  },
  errorSuggestions: {
    fontSize: 12,
    color: '#7F1D1D',
    fontFamily: 'DMSans',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSansSemiBold',
  },
});
