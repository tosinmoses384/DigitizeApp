import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router } from "expo-router";
import StackHeader from "../../components/StackHeader";
import UploadComponent from "../../components/UploadComponent";
import CustomButton from "../../components/CustomButton";
import ImageDescriptionModal from "../../components/ImageDescriptionModal";
import { ImageDescription } from "../../components/ImageDescriptionModal/types";
import { useOptimizedImagePicker } from "../../hooks/useOptimizedImagePicker";
import { uploadImagesAndSubmit } from "../../services/features/item-upload/itemUploadService";
import { useAppSelector } from "../../redux/store";
import { ImageData } from "@components/ImageDescriptionModal/types";
import { arrayRemoveDuplicatesByKey } from "@utils/collection-helper";
import { useI18n } from "../../hooks/use-i18n";

const Items = () => {
  const { t } = useI18n();
  const [uploadedImages, setUploadedImages] = useState<ImageData[]>([]);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const [isSelectingImage, setIsSelectingImage] = useState(false); // to indicating a user is currently selecting image(s)

  // Image description modal state
  const [isDescriptionModalVisible, setIsDescriptionModalVisible] =
    useState(false);
  const [imageDescriptions, setImageDescriptions] = useState<
    ImageDescription[]
  >([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasDraftDescriptions, setHasDraftDescriptions] = useState(false);

  // Get authentication token from Redux store
  const { token } = useAppSelector((state) => state?.userProfileSlice);

  const {
    pickImageFromGallery,
    captureImageFromCamera,
    pickMultipleImages,
    isProcessing,
    processingProgress,
    error,
    clearError,
    getProcessingStats,
    usePreset,
  } = useOptimizedImagePicker({
    maxFileSize: 1024 * 1024,
    maxResolution: { width: 1920, height: 1080 },
    quality: 0.85,
    format: "auto",
    enableCropping: false,
    enableProgressTracking: true,
    enablePerformanceMonitoring: true,
    enableAdvancedRecovery: true,
    processing: {
      enableProgressiveJPEG: true,
      preserveTransparency: true,
      stripMetadata: true,
      enableSmartCropping: false,
      compressionAlgorithm: "balanced",
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
      maxRetryAttempts: 3,
      enableParameterAdjustment: true,
      timeoutMs: 30000,
    },
  });

  useEffect(() => {
    const existingDescriptionsMap = new Map(
      imageDescriptions.map((desc) => [desc.imageUri, desc]),
    );

    const newDescriptions = uploadedImages.map((image) => {
      const existing = existingDescriptionsMap.get(image.uri);
      if (existing) {
        return existing;
      }
      return {
        imageUri: image.uri,
        originalFileSize: image.originalFileSize,
        fileSize: image.fileSize,
        compressionRatio: image.compressionRatio,
        brandId: null,
        categoryId: null,
        sizeId: null,
        colourId: null,
        selectedBrandId: null,
        selectedCategoryId: null,
        selectedSizeId: null,
        selectedColourId: null,
        seasonId: null,
        selectedSeasonId: null,
        isValid: false,
        hasBeenEdited: false,
        isSkipped: false,
      };
    });

    setImageDescriptions(newDescriptions);
  }, [uploadedImages]);

  useEffect(() => {
    if (currentImageIndex >= uploadedImages.length && uploadedImages.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [uploadedImages.length, currentImageIndex]);

  const handleUploadFromGallery = async () => {
    try {
      clearError();
      
      const results = await pickMultipleImages(
        {
          mediaTypes: "images",
          allowsEditing: false,
          quality: 0.9,
        },
        {
          processing: {
            enableProgressiveJPEG: true,
            preserveTransparency: true,
            stripMetadata: true,
            enableSmartCropping: true,
            compressionAlgorithm: "high_quality",
            enableEnhancement: false,
            enableBackgroundRemoval: false,
          },
        },
      );

      const imageDataArray: ImageData[] = results.map((result) => ({
        uri: result.uri,
        originalFileSize: result.originalFileSize,
        fileSize: result.fileSize,
        compressionRatio: result.compressionRatio,
      }));

      setUploadedImages((prev) => {
        const newImages = [...prev, ...imageDataArray];
        console.log(
          `Added ${imageDataArray.length} images from gallery. Total: ${newImages.length}`,
        );
        return newImages;
      });
    } catch (err: any) {
      console.error("Gallery upload failed:", err);

      const errorMessage = [
        err.message || "Failed to process images from gallery",
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
  };

  const handleTakeNewPhotos = async () => {
    try {
      clearError();
      
      const result = await captureImageFromCamera(
        {
          mediaTypes: "images",
          cameraType: "back",
          allowsEditing: false,
          quality: 0.9,
        },
        {
          processing: {
            enableProgressiveJPEG: true,
            preserveTransparency: false,
            stripMetadata: true,
            enableSmartCropping: true,
            compressionAlgorithm: "balanced",
            enableEnhancement: false,
            enableBackgroundRemoval: false,
          },
        },
      );

      const imageData: ImageData = {
        uri: result.uri,
        originalFileSize: result.originalFileSize,
        fileSize: result.fileSize,
        compressionRatio: result.compressionRatio,
      };

      setUploadedImages((prev) => {
        const newImages = [...prev, imageData];
        return newImages;
      });
    } catch (err: any) {
      
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
  };
  const handleAddNewPhotosFromGoogle = async (
    imageUri: string | Array<string>,
  ) => {
    try {
      clearError();
      console.log("=== items.tsx: handleAddNewPhotosFromGoogle ===");
      console.log("Received imageUri type:", typeof imageUri);
      console.log("Received imageUri value:", JSON.stringify(imageUri, null, 2));
      
      let imageData: Array<ImageData>;
      if (typeof imageUri === "string") {
        imageData = [
          {
            uri: imageUri,
            originalFileSize: null,
            fileSize: null,
            compressionRatio: null,
          },
        ];
        console.log("Single image data created:", JSON.stringify(imageData, null, 2));
      } else {
        imageData = imageUri.map((uri) => ({
          uri: uri,
          originalFileSize: null,
          fileSize: null,
          compressionRatio: null,
        }));
        console.log("Multiple images data created:", JSON.stringify(imageData, null, 2));
      }

      setUploadedImages((prev) => {
        const combined = arrayRemoveDuplicatesByKey([...prev, ...imageData], "uri");
        console.log("Total uploaded images after adding:", combined.length);
        console.log("Uploaded images URIs:", combined.map(img => ({
          uri: img.uri,
          isRemote: img.uri.startsWith('http'),
          hasFileScheme: img.uri.startsWith('file://')
        })));
        return combined;
      });
    } catch (err: any) {
      console.error("=== Error in handleAddNewPhotosFromGoogle ===", err);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setUploadedImages((prev) =>
            prev.filter((_, index) => index !== indexToRemove),
          );
          setFailedImages((prev) => {
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
  };

  const handleImageError = (index: number) => {
    console.error(
      `Image failed to load at index ${index}:`,
      uploadedImages[index],
    );
    setFailedImages((prev) => new Set([...prev, index]));
  };

  const handleImageLoad = (index: number) => {
    console.log(
      `Image loaded successfully at index ${index}:`,
      uploadedImages[index],
    );
    setFailedImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  // Start description flow
  const handleStartDescriptionFlow = useCallback(() => {
    if (uploadedImages.length === 0) {
      Alert.alert("No Images", "Please add some images before proceeding.");
      return;
    }

    // Initialize description data for each image
    const initialDescriptions: ImageDescription[] = uploadedImages.map(image => ({
      imageUri: image.uri,
      originalFileSize: image.originalFileSize,
      fileSize: image.fileSize,
      compressionRatio: image.compressionRatio,
      brandId: null,
      categoryId: null,
      sizeId: null,
      colourId: null,
      selectedBrandId: null,
      selectedCategoryId: null,
      selectedSizeId: null,
      selectedColourId: null,
      seasonId: null,
      selectedSeasonId: null,
      isValid: false,
      hasBeenEdited: false,
      isSkipped: false,
    }));
    
    setImageDescriptions(initialDescriptions);
    setCurrentImageIndex(0);
    setIsDescriptionModalVisible(true);
  }, [uploadedImages]);

  // Resume description flow (if there are draft descriptions)
  const handleResumeDescriptionFlow = useCallback(() => {
    if (imageDescriptions.length > 0) {
      setIsDescriptionModalVisible(true);
    } else {
      handleStartDescriptionFlow();
    }
  }, [imageDescriptions, handleStartDescriptionFlow]);

  // Handle modal close
  const handleCloseDescriptionModal = useCallback(
    (reason: "success" | "manual") => {
      setIsDescriptionModalVisible(false);

      if (reason === "success") {
        // On successful submission, clear everything and navigate
        setUploadedImages([]);
        setFailedImages(new Set());
        setImageDescriptions([]);
        setHasDraftDescriptions(false);
        router.replace("/(authenticated)/(tabs)/wardrobe");
      } else {
        // On manual close, just save draft status
        const hasEdits = imageDescriptions.some(
          (desc) => desc.hasBeenEdited || desc.isValid || desc.isSkipped,
        );
        setHasDraftDescriptions(hasEdits);
      }
    },
    [imageDescriptions],
  );

  // Handle image descriptions save
  const handleSaveDescriptions = useCallback(
    (descriptions: ImageDescription[]) => {
      setImageDescriptions(descriptions);
      const hasEdits = descriptions.some(
        (desc) => desc.hasBeenEdited || desc.isValid || desc.isSkipped,
      );
      setHasDraftDescriptions(hasEdits);
    },
    [],
  );

  // Handle image change in modal
  const handleImageChange = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  // Handle skip image
  const handleSkipImage = useCallback(
    (index: number) => {
      if (index < imageDescriptions.length - 1) {
        setCurrentImageIndex(index + 1);
      }
    },
    [imageDescriptions.length],
  );

  // Handle delete image
  const handleDeleteImage = useCallback(
    (index: number) => {
      const updatedDescriptions = imageDescriptions.filter(
        (_, i) => i !== index,
      );
      const updatedUploadedImages = uploadedImages.filter(
        (_, i) => i !== index,
      );

      setImageDescriptions(updatedDescriptions);
      setUploadedImages(updatedUploadedImages);

      // Adjust current index if needed
      if (index === currentImageIndex && index > 0) {
        setCurrentImageIndex(index - 1);
      } else if (updatedDescriptions.length === 0) {
        setIsDescriptionModalVisible(false);
        setHasDraftDescriptions(false);
      }
    },
    [imageDescriptions, uploadedImages, currentImageIndex],
  );

  // Handle replace image
  const handleReplaceImage = useCallback(
    async (index: number) => {
      try {
        clearError();
        console.log("Starting image replacement...");

        const result = await pickMultipleImages(
          {
            mediaTypes: "images",
            allowsEditing: false,
            quality: 0.9,
          },
          {
            processing: {
              enableProgressiveJPEG: true,
              preserveTransparency: true,
              stripMetadata: true,
              enableSmartCropping: true,
              compressionAlgorithm: "high_quality",
              enableEnhancement: false,
              enableBackgroundRemoval: false,
            },
          },
        );

        if (result.length > 0) {
          const newImageData: ImageData = {
            uri: result[0].uri,
            originalFileSize: result[0].originalFileSize,
            fileSize: result[0].fileSize,
            compressionRatio: result[0].compressionRatio,
          };

          // Update uploaded images
          const updatedUploadedImages = [...uploadedImages];
          updatedUploadedImages[index] = newImageData;
          setUploadedImages(updatedUploadedImages);

          // Update image descriptions (preserve form data)
          const updatedDescriptions = [...imageDescriptions];
          updatedDescriptions[index] = {
            ...updatedDescriptions[index],
            imageUri: newImageData.uri,
            originalFileSize: newImageData.originalFileSize,
            fileSize: newImageData.fileSize,
            compressionRatio: newImageData.compressionRatio,
          };
          setImageDescriptions(updatedDescriptions);
        }
      } catch (err: any) {
        console.error("Image replacement failed:", err);
        Alert.alert("Error", "Failed to replace image. Please try again.");
      }
    },
    [uploadedImages, imageDescriptions, pickMultipleImages, clearError],
  );


   const handleUploadToServer = async () => {
     if (uploadedImages.length === 0) {
       Alert.alert("No Images", "Please add some images before uploading.");
       return;
     }

     if (!token) {
       Alert.alert("Authentication Error", "Please log in again to upload images.");
       router.replace("/Onboarding");
       return;
     }

     setIsUploading(true);
     
     try {
       
       // Convert uploaded images to the format expected by the API
       const assets = uploadedImages.map(image => ({
         uri: image.uri,
         mimeType: 'image/jpeg', // Default to JPEG, could be inferred from actual type
       }));
       
       // Call the upload service API
       const { uploadResult, submissionResult } = await uploadImagesAndSubmit(assets, token);
       
       if (uploadResult.success && submissionResult?.success) {
         
         Alert.alert(
           "Upload Successful! 🎉",
           submissionResult.message || `All ${uploadedImages.length} images have been uploaded successfully.`,
           [
             {
               text: "Continue",
               onPress: () => {
                 // Clear uploaded images and navigate to wardrobe
                 setUploadedImages([]);
                 setFailedImages(new Set());
                 
                 if (submissionResult.shouldNavigateToWardrobe) {
                   router.replace('/(authenticated)/(tabs)/wardrobe');
                 }
               }
             }
           ]
         );
         
       } else if (submissionResult?.shouldNavigateToOnboarding) {
         // Handle 401 authentication error
         Alert.alert(
           "Session Expired",
           "Your session has expired. Please log in again.",
           [
             {
               text: "OK",
               onPress: () => router.replace("/Onboarding")
             }
           ]
         );
         
       } else {
         // Handle other errors
         const errorMessage = submissionResult?.error || uploadResult.error || "Upload failed. Please try again.";
         
         Alert.alert(
           "Upload Failed ❌",
           errorMessage,
           [
             { text: "Cancel", style: "cancel" },
             { text: "Retry", onPress: handleUploadToServer }
           ]
         );
       }
       
     } catch (error: any) {
       
       // Check if it's a network error or other specific error types
       let errorMessage = "Failed to upload images to server. Please try again.";
       
       if (error?.message) {
         if (error.message.includes('Network')) {
           errorMessage = "Network error. Please check your internet connection and try again.";
         } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
           // Handle 401 errors in catch block too
           Alert.alert(
             "Session Expired",
             "Your session has expired. Please log in again.",
             [
               {
                 text: "OK",
                 onPress: () => router.replace("/Onboarding")
               }
             ]
           );
           return;
         } else {
           errorMessage = error.message;
         }
       }
       
       Alert.alert(
         "Upload Failed ❌",
         errorMessage,
         [
           { text: "Cancel", style: "cancel" },
           { text: "Retry", onPress: handleUploadToServer }
         ]
       );
     } finally {
       setIsUploading(false);
     }
   };

   const handleGoBack = () => {
     if ((uploadedImages.length > 0 || hasDraftDescriptions) && !isUploading) {
       Alert.alert(
         t('wardrobe.discardChanges'),
         t('wardrobe.unsavedChangesMessage'),
         [
           { text: t('wardrobe.cancel'), style: "cancel" },
           { 
             text: t('wardrobe.discard'), 
             style: "destructive",
             onPress: () => {
               setUploadedImages([]);
               setFailedImages(new Set());
               setImageDescriptions([]);
               setHasDraftDescriptions(false);
               router.back();
             }
           }
         ]
       );
     } else {
       router.back();
     }
   };

  return (
    <SafeAreaView style={styles.container}>
      <StackHeader
        title={t('wardrobe.addToWardrobe')}
        onPress={handleGoBack}
        titleStyle={styles.headerTitleStyle}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          uploadedImages.length > 0 && styles.scrollContentWithButton,
        ]}
      >
        <UploadComponent
          onSelectingImage={setIsSelectingImage}
          uploadedImages={uploadedImages}
          onAddBrowsedImages={handleAddNewPhotosFromGoogle}
          failedImages={failedImages}
          isProcessing={isProcessing}
          processingProgress={processingProgress}
          error={error}
          onUploadFromGallery={handleUploadFromGallery}
          onTakeNewPhotos={handleTakeNewPhotos}
          onRemoveImage={handleRemoveImage}
          onImageError={handleImageError}
          onImageLoad={handleImageLoad}
          title={t('wardrobe.addPhoto')}
        />
      </ScrollView>

      {/* Floating Description Button - Always visible when images are available */}
      {!isSelectingImage && uploadedImages.length > 0 && (
        <View style={styles.floatingButtonContainer}>
          <CustomButton
            title={
              hasDraftDescriptions
                ? `Resume Descriptions (${uploadedImages.length} Image${uploadedImages.length > 1 ? "s" : ""})`
                : `Add Details for ${uploadedImages.length} Image${uploadedImages.length > 1 ? "s" : ""}`
            }
            onPress={
              hasDraftDescriptions
                ? handleResumeDescriptionFlow
                : handleStartDescriptionFlow
            }
            loader={isUploading}
            buttonStyle={styles.floatingButton}
            textStyle={styles.floatingButtonText}
            showLoadingText={true}
            disabled={isUploading || isProcessing}
          />
        </View>
      )}

      {/* Image Description Modal */}
      {isDescriptionModalVisible && imageDescriptions.length > 0 && (
        <ImageDescriptionModal
          isVisible={isDescriptionModalVisible}
          images={imageDescriptions}
          currentIndex={currentImageIndex}
          onClose={handleCloseDescriptionModal}
          onSave={handleSaveDescriptions}
          onImageChange={handleImageChange}
          onSkip={handleSkipImage}
          onDelete={handleDeleteImage}
          onReplaceImage={handleReplaceImage}
          token={token || ""}
        />
      )}
    </SafeAreaView>
  );
};

export default Items;

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
  scrollContentWithButton: {
    paddingBottom: 100, // Extra padding when floating button is visible
  },
  headerTitleStyle: {
    color: "#07090C",
    fontFamily: "DMSans",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 24,
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  floatingButton: {
    backgroundColor: "#D4313E",
    paddingVertical: 18,
    borderRadius: 14,
    shadowColor: "#D4313E",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0,
    alignItems: "center",
  },
  floatingButtonText: {
    color: "#FFFFFF",
    fontFamily: "DMSans",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
