import React, { useCallback, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import StackHeader from "../../components/StackHeader";
import UploadComponent from "../../components/UploadComponent";
import UploadStatusModal from "../../modals/status/UploadStatusModal";
import { useOptimizedImagePicker } from "../../hooks/useOptimizedImagePicker";
import { useVideoCompressor } from "../../hooks/useVideoCompressor";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { setRefetchPostList } from "../../redux/slice/profile/profileSlice";
import { useI18n } from "@hooks/use-i18n";

interface MediaData {
  uri: string;
  type: "image" | "video";
  originalFileSize: number;
  fileSize: number;
  compressionRatio: number;
  mimeType: string;
  fileName?: string;
  thumbnailUri?: string;
}

const CreateStory = () => {
  const { t } = useI18n();
  const [uploadedMedia, setUploadedMedia] = useState<MediaData[]>([]);
  const [failedMedia, setFailedMedia] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadStatusModalVisible, setIsUploadStatusModalVisible] =
    useState(false);

  const { compress, isCompressing: isCompressingVideo } = useVideoCompressor();

  // Get authentication token from Redux store
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const dispatch = useAppDispatch();

  const {
    pickImageFromGallery,
    captureImageFromCamera,
    pickVideoFromGallery,
    pickMediaFromGallery,
    isProcessing,
    processingProgress,
    error,
    clearError,
  } = useOptimizedImagePicker({
    maxFileSize: 1.8 * 1024 * 1024, // 1.8MB for stories (under 2MB API limit)
    maxResolution: null, // Limit resolution to reduce file size
    quality: 0.75, // Lower quality for smaller file size
    format: "jpeg", // Force JPEG for better compression
    enableCropping: false,
    enableProgressTracking: true,
    enablePerformanceMonitoring: true,
    enableAdvancedRecovery: true,
    processing: {
      enableProgressiveJPEG: true,
      preserveTransparency: false, // Disable transparency for JPEG
      stripMetadata: true,
      enableSmartCropping: false,
      compressionAlgorithm: "fast", // Use fast compression for smaller file size
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
      fallbackQuality: 0.5, // Lower fallback quality
      maxRetryAttempts: 3,
      enableParameterAdjustment: true,
      timeoutMs: 30000,
    },
  });

  const handleUploadFromGallery = useCallback(async () => {
    try {
      clearError();

      const result = await pickImageFromGallery(
        {
          mediaTypes: "images",
          allowsEditing: false,
          quality: 0.75, // Use configured quality
        },
        {
          processing: {
            enableProgressiveJPEG: true,
            preserveTransparency: false, // Disable for JPEG
            stripMetadata: true,
            enableSmartCropping: false, // Disable to maintain aspect ratio
            compressionAlgorithm: "fast", // Use fast compression for smaller file size
            enableEnhancement: false,
            enableBackgroundRemoval: false,
          },
        },
      );
      // Determine if it's an image or video based on the result
      const isVideo = "duration" in result;

      const mediaData: MediaData = {
        uri: result.uri,
        type: isVideo ? "video" : "image",
        originalFileSize: result.originalFileSize,
        fileSize: result.fileSize,
        compressionRatio: result.compressionRatio,
        mimeType: isVideo
          ? (result as any).mimeType || "video/mp4"
          : "image/jpeg",
        fileName: isVideo ? (result as any).fileName : undefined,
      };

      // Log file size information for debugging
      console.log('Story media processed:', {
        type: mediaData.type,
        originalFileSize: `${(mediaData.originalFileSize / 1024).toFixed(2)} KB`,
        finalFileSize: `${(mediaData.fileSize / 1024).toFixed(2)} KB`,
        compressionRatio: `${(mediaData.compressionRatio * 100).toFixed(1)}%`,
        underLimit: mediaData.fileSize <= (1.8 * 1024 * 1024),
        apiLimit: '2000 KB'
      });

      setUploadedMedia([mediaData]);

      // Immediately open UploadStatusModal after optimization
      openUploadStatusModal(mediaData);
    } catch (err: any) {
      // Don't show error alert if user cancelled the picker
      if (err.message === "User cancelled media selection") {
        return; // Silently handle cancellation
      }

      const errorMessage = [
        err.message || "Failed to process media from gallery",
        "",
        "💡 Suggestions:",
        ...(err.recoverySuggestions || ["Try again later"]),
      ].join("\n");

      Alert.alert(
        `${err.severity?.toUpperCase() || "ERROR"}: Upload Failed`,
        errorMessage,
        [
          { text: "Cancel", style: "cancel" as const },
          ...(err.retryable
            ? [{ text: "Retry", onPress: handleUploadFromGallery }]
            : []),
        ],
      );
    }
  }, [pickMediaFromGallery, clearError]);

  const handleTakeNewPhotos = useCallback(async () => {
    try {
      clearError();

      const result = await captureImageFromCamera(
        {
          mediaTypes: "images",
          cameraType: "back",
          allowsEditing: false,
          quality: 0.75, // Use configured quality
        },
        {
          processing: {
            enableProgressiveJPEG: true,
            preserveTransparency: false,
            stripMetadata: true,
            enableSmartCropping: false, // Disable to maintain aspect ratio
            compressionAlgorithm: "fast", // Use fast compression for smaller file size
            enableEnhancement: false,
            enableBackgroundRemoval: false,
          },
        },
      );

      const mediaData: MediaData = {
        uri: result.uri,
        type: "image",
        originalFileSize: result.originalFileSize,
        fileSize: result.fileSize,
        compressionRatio: result.compressionRatio,
        mimeType: "image/jpeg",
      };

      // Log file size information for debugging
      console.log('Story image captured:', {
        type: mediaData.type,
        originalFileSize: `${(mediaData.originalFileSize / 1024).toFixed(2)} KB`,
        finalFileSize: `${(mediaData.fileSize / 1024).toFixed(2)} KB`,
        compressionRatio: `${(mediaData.compressionRatio * 100).toFixed(1)}%`,
        underLimit: mediaData.fileSize <= (1.8 * 1024 * 1024),
        apiLimit: '2000 KB'
      });

      setUploadedMedia([mediaData]);

      // Immediately open UploadStatusModal after optimization
      openUploadStatusModal(mediaData);
    } catch (err: any) {
      // Don't show error alert if user cancelled the camera
      if (err.message === "User cancelled camera capture") {
        return; // Silently handle cancellation
      }

      const errorMessage = [
        err.message || "Failed to capture and process photo",
        "",
        "💡 Suggestions:",
        ...(err.recoverySuggestions || ["Try again later"]),
      ].join("\n");

      Alert.alert(
        `${err.severity?.toUpperCase() || "ERROR"}: Capture Failed`,
        errorMessage,
        [
          { text: "Cancel", style: "cancel" as const },
          ...(err.retryable
            ? [{ text: "Retry", onPress: handleTakeNewPhotos }]
            : []),
        ],
      );
    }
  }, [captureImageFromCamera, clearError]);

  const handleUploadVideo = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true, // Enable native trimming (works on iOS)
        videoMaxDuration: 30, // Limit selection to 60 seconds
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const originalAsset = result.assets[0];

      // Compress the video
      const compressedResult = await compress(originalAsset.uri, {
        compressionLevel: 'medium', // Balance quality and size
        maxSize: 2 * 1024 * 1024, // 2MB limit
        maxDuration: 30, // 60 seconds limit
      });

      // Generate thumbnail
      let thumbnailUri;
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(compressedResult.uri, {
          time: 1000,
        });
        thumbnailUri = uri;
      } catch (e) {
        console.warn("Could not generate thumbnail", e);
      }

      const mediaData: MediaData = {
        uri: compressedResult.uri,
        type: "video",
        originalFileSize: originalAsset.fileSize || compressedResult.originalSize,
        fileSize: compressedResult.size,
        compressionRatio: compressedResult.compressionRatio,
        mimeType: "video/mp4",
        fileName: originalAsset.fileName || `video_${Date.now()}.mp4`,
        thumbnailUri,
      };

      console.log('Story video compressed:', {
        originalSize: `${(mediaData.originalFileSize / 1024 / 1024).toFixed(2)} MB`,
        compressedSize: `${(mediaData.fileSize / 1024 / 1024).toFixed(2)} MB`,
        ratio: `${(mediaData.compressionRatio * 100).toFixed(1)}%`
      });

      setUploadedMedia([mediaData]);
      openUploadStatusModal(mediaData); // Disabled for testing video preview
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message || "Failed to process video");
    }
  }, [compress]);

  const openUploadStatusModal = useCallback((mediaData: MediaData) => {
    // Set the media data in state and show the modal
    setUploadedMedia([mediaData]);
    setIsUploadStatusModalVisible(true);
  }, []);

  const handleCloseUploadStatusModal = useCallback(() => {
    setIsUploadStatusModalVisible(false);
    setUploadedMedia([]);

    // Navigate back to home page
    router.back();
  }, []);

  const handleRemoveMedia = useCallback((indexToRemove: number) => {
    Alert.alert("Remove Media", "Are you sure you want to remove this media?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setUploadedMedia((prev) =>
            prev.filter((_, index) => index !== indexToRemove),
          );
          setFailedMedia((prev) => {
            const newSet = new Set(prev);
            newSet.delete(indexToRemove);
            const adjustedSet = new Set<number>();
            newSet.forEach((index) => {
              if (index > indexToRemove) {
                adjustedSet.add(index - 1);
              } else {
                adjustedSet.add(index);
              }
            });
            return adjustedSet;
          });
        },
      },
    ]);
  }, []);

  const handleMediaError = useCallback((index: number) => {
    setFailedMedia((prev) => new Set([...prev, index]));
  }, []);

  const handleMediaLoad = useCallback((index: number) => {
    setFailedMedia((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }, []);

  const handleGoBack = useCallback(() => {
    if (uploadedMedia.length > 0 && !isUploading) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to cancel? Your media will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setUploadedMedia([]);
              setFailedMedia(new Set());
              router.back();
            },
          },
        ],
      );
    } else {
      router.back();
    }
  }, [uploadedMedia.length, isUploading]);

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader
        title={t('story.createNewStory')}
        onPress={handleGoBack}
        titleStyle={styles.headerTitleStyle}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <UploadComponent
          uploadedImages={uploadedMedia}
          failedImages={failedMedia}
          isProcessing={isProcessing}
          processingProgress={processingProgress}
          error={error}
          onUploadFromGallery={handleUploadFromGallery}
          onTakeNewPhotos={handleTakeNewPhotos}
          onUploadVideo={handleUploadVideo}
          onRemoveImage={handleRemoveMedia}
          onImageError={handleMediaError}
          onImageLoad={handleMediaLoad}
          title={t('story.addPhotoOrVideo')}
          maxMediaCount={1}
          allowedMediaTypes="mixed"
        />
      </ScrollView>

      {/* Upload Status Modal */}
      {isUploadStatusModalVisible && (
        <UploadStatusModal
          isShow={isUploadStatusModalVisible}
          onClose={handleCloseUploadStatusModal}
          fileDetails={uploadedMedia.map((media) => ({
            uri: media.uri,
            type: media.type,
            mimeType: media.mimeType,
            fileName: media.fileName,
            fileSize: media.fileSize,
          }))}
          refetch={() => {
            // Set flag to refresh home page when user returns
            dispatch(setRefetchPostList(true));
            console.log("Story uploaded successfully - will refresh home page");
          }}
          loader={isUploading}
        />
      )}
    </SafeAreaView>
  );
};

export default CreateStory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  headerTitleStyle: {
    color: "#07090C",
    fontFamily: "DMSans",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 24,
  },
});
