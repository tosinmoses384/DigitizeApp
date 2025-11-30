import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// Import components
import HorizontalStepper from '../HorizontalStepper';
import SelectWithDrawer from '../SelectWithDrawer';
import SelectItemBrandModal from '../../modals/SelectItemBrandModal';
import SelectItemColorModal from '../../modals/SelectItemColorModal';
import SelectItemSizeModal from '../../modals/SelectItemSizeModal';
import SelectItemCategoryModal from 'modals/SelectItemCategoryModal';
import SelectSeasonModal from '../../modals/SelectSeasonModal';
import { useToast } from 'react-native-toast-notifications';

// Import types and styles
import { 
  ImageDescriptionModalProps, 
  ActionBarProps, 
  ImageNavigationProps,
  ImageDescription 
} from './types';
import { modalStyles } from './styles';
import { getErrorMessage, validateImageData, createTimeoutPromise } from './utils';

// Import services
import { uploadMultipleImages } from '../../services/features/item-upload/itemUploadService';
import wardrobeServices from '../../services/features/wardrobe-service/wardrobeServices';
import { prepareMultipleImagesForUpload, cleanupCachedImages } from '../../utils/image-upload-helper';

// Validation schema
const imageDescriptionValidationSchema = Yup.object().shape({
  selectedBrandId: Yup.string().required('Brand is required'),
  selectedSizeId: Yup.string().required('Size is required'),
  selectedColourId: Yup.string().required('Color is required'),
  selectedCategoryId: Yup.string().required('Category is required'),
  selectedSeasonId: Yup.string().required('Season is required'),
});

// Action Bar Component
const ActionBar: React.FC<ActionBarProps> = ({
  onSkip,
  onNext,
  onDelete,
  isLastImage,
  isLoading,
  nextButtonText,
}) => {
  return (
    <View style={modalStyles.actionBar}>
      <TouchableOpacity
        style={[modalStyles.actionButton, modalStyles.skipButton]}
        onPress={onSkip}
        disabled={isLoading}
      >
        <Text style={modalStyles.skipButtonText}>Skip for Later</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[modalStyles.actionButton, modalStyles.nextButton]}
        onPress={onNext}
        disabled={isLoading}
      >
        <Text style={modalStyles.nextButtonText}>
          {nextButtonText || (isLastImage ? 'Save All' : 'Next')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[modalStyles.actionButton, modalStyles.deleteButton]}
        onPress={onDelete}
        disabled={isLoading}
      >
        <Ionicons name="trash-outline" size={20} color="#D4313E" />
      </TouchableOpacity>
    </View>
  );
};

// Image Navigation Component
const ImageNavigation: React.FC<ImageNavigationProps> = ({
  imageUri,
  onPrevious,
  onNext,
  onChangeImage,
  showPrevious,
  showNext,
  imageIndex,
  totalImages,
}) => {
  const handleSwipe = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;
      if (translationX > 50 && showPrevious) {
        onPrevious();
      } else if (translationX < -50 && showNext) {
        onNext();
      }
    }
  };

  return (
    <View style={modalStyles.imageSection}>
      <PanGestureHandler onHandlerStateChange={handleSwipe}>
        <View style={modalStyles.imageContainer}>
          <Image
            source={{ uri: imageUri }}
            style={modalStyles.image}
            resizeMode="contain"
          />
          
          {/* Navigation arrows */}
          <View style={modalStyles.imageNavigation}>
            {showPrevious ? (
              <TouchableOpacity
                style={modalStyles.navButton}
                onPress={onPrevious}
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 44 }} />
            )}

            {showNext ? (
              <TouchableOpacity
                style={modalStyles.navButton}
                onPress={onNext}
              >
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>

          {/* Change image button */}
          <View style={modalStyles.changeImageContainer}>
            <TouchableOpacity
              style={modalStyles.changeImageButton}
              onPress={onChangeImage}
            >
              <Ionicons name="camera" size={16} color="#FFFFFF" />
              <Text style={modalStyles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PanGestureHandler>
    </View>
  );
};

// Main Modal Component
const ImageDescriptionModal: React.FC<ImageDescriptionModalProps> = ({
  isVisible,
  images,
  currentIndex,
  onClose,
  onSave,
  onImageChange,
  onSkip,
  onDelete,
  onReplaceImage,
  token,
}) => {
  const toast = useToast();
  const [drawerType, setDrawerType] = useState<'brand' | 'size' | 'colour' | 'category' | 'season' | null>(null);
  const [submissionState, setSubmissionState] = useState({
    status: 'idle', // idle | uploading | submitting | failed
    uploadedRequestIds: null as string[] | null,
    errorType: null as 'upload_error' | 'submission_error' | null,
    originatingHandler: null as 'final' | 'skip' | null,
    errorMessage: null as string | null,
  });

  // Create stepper data
  const stepperData = useMemo(() => {
    return images.map((image, index) => ({
      id: `step-${index}`,
      isCompleted: image.isValid || false,
      isAccessible: true,
      isSkipped: image.isSkipped || false,
    }));
  }, [images]);

  // Current image formik
  const currentImageFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      brandId: images[currentIndex]?.brandId || '',
      sizeId: images[currentIndex]?.sizeId || '',
      colourId: images[currentIndex]?.colourId || '',
      categoryId: images[currentIndex]?.categoryId || '',
      seasonId: images[currentIndex]?.seasonId || '',
      selectedBrandId: images[currentIndex]?.selectedBrandId || '',
      selectedSizeId: images[currentIndex]?.selectedSizeId || '',
      selectedColourId: images[currentIndex]?.selectedColourId || '',
      selectedCategoryId: images[currentIndex]?.selectedCategoryId || '',
      selectedSeasonId: images[currentIndex]?.selectedSeasonId || '',
    },
    validationSchema: imageDescriptionValidationSchema,
    onSubmit: () => {
      // Handle submit
    },
  });

  // Save current image data
  const saveCurrentImageData = useCallback(() => {
    const updatedImages = [...images];
    const hasValidData = currentImageFormik.values.selectedBrandId && 
                        currentImageFormik.values.selectedSizeId && 
                        currentImageFormik.values.selectedColourId && 
                        currentImageFormik.values.selectedCategoryId;
    
    updatedImages[currentIndex] = {
      ...updatedImages[currentIndex],
      brandId: currentImageFormik.values.brandId,
      categoryId: currentImageFormik.values.categoryId,
      sizeId: currentImageFormik.values.sizeId,
      colourId: currentImageFormik.values.colourId,
      seasonId: currentImageFormik.values.seasonId,
      selectedBrandId: currentImageFormik.values.selectedBrandId,
      selectedCategoryId: currentImageFormik.values.selectedCategoryId,
      selectedSizeId: currentImageFormik.values.selectedSizeId,
      selectedColourId: currentImageFormik.values.selectedColourId,
      selectedSeasonId: currentImageFormik.values.selectedSeasonId,
      hasBeenEdited: true,
      isValid: Boolean(hasValidData),
      isSkipped: false, // Reset skip status when saving
    };
    
    onSave(updatedImages);
    return updatedImages;
  }, [currentImageFormik.values, images, currentIndex, onSave]);

  // Final submission handler - only called when all items are processed
  const handleFinalSubmission = useCallback(async (
    updatedImages?: ImageDescription[]
  ) => {
    const imagesToValidate = updatedImages || images;
    try {
      // Pre-validation
      const validImages = imagesToValidate.filter((img) => !img.isSkipped && img.isValid);
      if (validImages.length === 0) {
        Alert.alert(
          'No Completed Items', 
          'Please complete at least one item before saving. You can: Fill in item details for at least one image Use "Skip for Later" to save without details',
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      // Validate image data integrity
      const validation = validateImageData(validImages);
      if (!validation.isValid) {
        Alert.alert(
          'Missing Information',
          `Please complete the following:\n\n${validation.errors.join('\n')}`,
          [{ text: 'OK', style: 'default' }]
        );
        return;
      }

      let requestIds = submissionState.uploadedRequestIds;

      // Phase 1: Upload Images (if not already uploaded)
      if (!requestIds) {
        setSubmissionState((prevState) => ({ 
          ...prevState, 
          status: 'uploading', 
          uploadedRequestIds: null, 
          errorType: null,
          originatingHandler: 'final' 
        }));

        
        const imageUris = validImages.map(image => image.imageUri);
        const preparedAssets = await prepareMultipleImagesForUpload(imageUris);
        
        // Add timeout to prevent hanging
        const uploadResult = await createTimeoutPromise(
          uploadMultipleImages(preparedAssets, token),
          60000 // 60 second timeout for uploads
        );

        console.log("=== ImageDescriptionModal: Upload Result Received ===");
        console.log("Upload result:", JSON.stringify({
          success: uploadResult?.success,
          hasRequestIds: !!uploadResult?.allRequestIds,
          requestIdsCount: uploadResult?.allRequestIds?.length,
          error: uploadResult?.error,
          uploadedImagesCount: uploadResult?.uploadedImages?.length,
          failedUploadsCount: uploadResult?.failedUploads?.length
        }, null, 2));

        if (!uploadResult) {
          throw new Error('No response received from upload service. Please check your connection and try again.');
        }

        if (!uploadResult.success || !uploadResult.allRequestIds) {
          const errorMessage = uploadResult.error || 'Failed to upload images';
          console.log("=== Upload Failed ===", errorMessage);
          throw new Error(errorMessage);
        }
        
        console.log("=== Upload Successful ===");
        console.log("Request IDs:", uploadResult.allRequestIds);
        requestIds = uploadResult.allRequestIds;
        setSubmissionState((prevState) => ({ 
          ...prevState, 
          status: 'uploading', 
          uploadedRequestIds: requestIds 
        }));
      }

      if (!requestIds) {
        throw new Error('Failed to get request IDs for submission');
      }

      // Phase 2: Submit Metadata
      setSubmissionState((prevState) => ({ 
        ...prevState, 
        status: 'submitting', 
        uploadedRequestIds: requestIds 
      }));
      const itemsPayload = requestIds.map((requestId: string, index: number) => {
        const description = validImages[index];
        return {
          requestId: requestId,
          brandId: description.selectedBrandId || null,
          categoryId: description.selectedCategoryId || null,
          sizeId: description.selectedSizeId || null,
          colourIds: description.selectedColourId ? [description.selectedColourId] : null,
          seasonId: description.selectedSeasonId || null,
        };
      });

      // Add timeout for submission
      if (!wardrobeServices) {
        throw new Error('Wardrobe service is not available. Please try again later.');
      }
      
      const submissionResult = await createTimeoutPromise(
        wardrobeServices.submitMultipleItems(itemsPayload, token),
        30000 // 30 second timeout for submission
      );

      // Handle undefined or null response
      if (!submissionResult) {
        throw new Error('No response received from server. Please check your connection and try again.');
      }

      if (submissionResult.status === 200) {
        toast.show('Upload Successful! 🎉', {
          type: 'success',
          duration: 3000,
        });
        onClose('success');
        setSubmissionState({ 
          status: 'idle', 
          uploadedRequestIds: null, 
          errorType: null,
          originatingHandler: null,
          errorMessage: null 
        });
      } else {
        const errorMessage = submissionResult.detail || 
                           submissionResult.message || 
                           `Server returned status ${submissionResult.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorInfo = getErrorMessage(error);
      
      // If not retryable, show alert and reset
      if (!errorInfo.isRetryable) {
        Alert.alert(
          errorInfo.title,
          errorInfo.message,
          [
            { 
              text: 'OK', 
              onPress: () => {
                setSubmissionState({ 
                  status: 'idle', 
                  uploadedRequestIds: null, 
                  errorType: null,
                  originatingHandler: null,
                  errorMessage: null 
                });
                if (errorInfo.title === 'Authentication Error') {
                  onClose('manual');
                }
              }
            }
          ]
        );
        return;
      }
      
      setSubmissionState((prevState) => ({
        ...prevState,
        status: 'failed',
        errorType: prevState.status === 'uploading' ? 'upload_error' : 'submission_error',
        originatingHandler: prevState.originatingHandler || 'final',
        errorMessage: errorInfo.message
      }));
    }
  }, [images, token, onClose, submissionState]);

  const handleSkipAndSubmit = useCallback(async (updatedImagesArray?: ImageDescription[]) => {
    try {
      const imagesToUse = updatedImagesArray || images;
      let requestIds = submissionState.uploadedRequestIds;

      // Phase 1: Upload Images (if not already uploaded)
      if (!requestIds) {
        setSubmissionState((prevState) => ({ 
          ...prevState, 
          status: 'uploading', 
          uploadedRequestIds: null, 
          errorType: null,
          originatingHandler: 'skip' 
        }));
        
        if (imagesToUse.length === 0) {
          Alert.alert(
            'No Images', 
            'There are no images to upload.',
            [{ text: 'OK', onPress: () => onClose('manual') }]
          );
          return;
        }
        
        const imageUris = imagesToUse.map(image => image.imageUri);
        const preparedAssets = await prepareMultipleImagesForUpload(imageUris);
        
        // Add timeout to prevent hanging
        const uploadResult = await createTimeoutPromise(
          uploadMultipleImages(preparedAssets, token),
          60000 // 60 second timeout for uploads
        );

        if (!uploadResult) {
          throw new Error('No response received from upload service. Please check your connection and try again.');
        }

        if (!uploadResult.success || !uploadResult.allRequestIds) {
          const errorMessage = uploadResult.error || 'Failed to upload images';
          throw new Error(errorMessage);
        }
        requestIds = uploadResult.allRequestIds;
        setSubmissionState((prevState) => ({ 
          ...prevState, 
          status: 'uploading', 
          uploadedRequestIds: requestIds 
        }));
      }

      if (!requestIds) {
        throw new Error('Failed to get request IDs for submission');
      }

      // Phase 2: Submit Metadata
      setSubmissionState((prevState) => ({ 
        ...prevState, 
        status: 'submitting', 
        uploadedRequestIds: requestIds 
      }));
      const itemsPayload = requestIds.map((requestId: string, index: number) => {
        const description = imagesToUse[index];
        return {
          requestId: requestId,
          brandId: description.selectedBrandId || null,
          categoryId: description.selectedCategoryId || null,
          sizeId: description.selectedSizeId || null,
          colourIds: description.selectedColourId ? [description.selectedColourId] : null,
          seasonId: description.selectedSeasonId || null,
        };
      });

      // Add timeout for submission
      if (!wardrobeServices) {
        throw new Error('Wardrobe service is not available. Please try again later.');
      }
      
      const submissionResult = await createTimeoutPromise(
        wardrobeServices.submitMultipleItems(itemsPayload, token),
        30000 // 30 second timeout for submission
      );

      // Handle undefined or null response
      if (!submissionResult) {
        throw new Error('No response received from server. Please check your connection and try again.');
      }

      if (submissionResult.status === 200) {
        toast.show('Progress Saved! 🎉', {
          type: 'success',
          duration: 3000,
        });
        onClose('success');
        setSubmissionState({ 
          status: 'idle', 
          uploadedRequestIds: null, 
          errorType: null,
          originatingHandler: null,
          errorMessage: null 
        });
      } else {
        const errorMessage = submissionResult.detail || 
                           submissionResult.message || 
                           `Server returned status ${submissionResult.status}`;
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorInfo = getErrorMessage(error);
      
      // If not retryable, show alert and reset
      if (!errorInfo.isRetryable) {
        Alert.alert(
          errorInfo.title,
          errorInfo.message,
          [
            { 
              text: 'OK', 
              onPress: () => {
                setSubmissionState({ 
                  status: 'idle', 
                  uploadedRequestIds: null, 
                  errorType: null,
                  originatingHandler: null,
                  errorMessage: null 
                });
                if (errorInfo.title === 'Authentication Error') {
                  onClose('manual');
                }
              }
            }
          ]
        );
        return;
      }
      
      setSubmissionState((prevState) => ({
        ...prevState,
        status: 'failed',
        errorType: prevState.status === 'uploading' ? 'upload_error' : 'submission_error',
        originatingHandler: prevState.originatingHandler || 'skip',
        errorMessage: errorInfo.message
      }));
    }
  }, [images, token, onClose, submissionState]);

  const triggerSkipAndSubmit = useCallback((updatedImagesArray?: ImageDescription[]) => {
    handleSkipAndSubmit(updatedImagesArray);
  }, [handleSkipAndSubmit]);


  // Check if we're on the last image and should show final submission
  const isOnLastImage = currentIndex === images.length - 1;

  // Load current image data when image changes
  useEffect(() => {
    if (images.length === 0) {
      return;
    }
    
    const currentImage = images[currentIndex];
    if (currentImage) {
      // Reset form with current image data
      currentImageFormik.resetForm({
        values: {
          selectedBrandId: currentImage.selectedBrandId || '',
          selectedSizeId: currentImage.selectedSizeId || '',
          selectedColourId: currentImage.selectedColourId || '',
          selectedCategoryId: currentImage.selectedCategoryId || '',
          selectedSeasonId: currentImage.selectedSeasonId || '',
          brandId: currentImage.brandId || '',
          sizeId: currentImage.sizeId || '',
          colourId: currentImage.colourId || '',
          categoryId: currentImage.categoryId || '',
          seasonId: currentImage.seasonId || '',
        },
      });
      
      // Clear any previous touch state
      currentImageFormik.setTouched({}, false);
    }
  }, [currentIndex, images]); // Include images dependency to handle array changes

  // Navigation handlers
  const handleNext = useCallback(async () => {
    //
    // Set all fields to touched to trigger validation display
    currentImageFormik.setTouched({
      selectedBrandId: true,
      selectedSizeId: true,
      selectedColourId: true,
      selectedCategoryId: true,
      selectedSeasonId: true,
    });

    // Validate the form
    const errors = await currentImageFormik.validateForm();

    // If the form is valid (no errors), proceed
    if (Object.keys(errors).length === 0) {
      const updatedImages = saveCurrentImageData();

      if (isOnLastImage) {
        handleFinalSubmission(updatedImages);
      } else {
        onImageChange(currentIndex + 1);
      }
    } else {
      // Do nothing, the UI will show errors for touched fields
    }
  }, [
    currentImageFormik,
    saveCurrentImageData,
    currentIndex,
    isOnLastImage,
    onImageChange,
    handleFinalSubmission,
  ]);

  const handleStepNavigation = (index: number) => {
    // Save any entered data without validating before switching steps
    saveCurrentImageData();
    onImageChange(index);
  };

  const handleArrowNavigation = (direction: 'next' | 'previous') => {
    // Save any entered data without validating
    saveCurrentImageData();

    if (direction === 'next' && currentIndex < images.length - 1) {
      onImageChange(currentIndex + 1);
    } else if (direction === 'previous' && currentIndex > 0) {
      onImageChange(currentIndex - 1);
    }
  };

  const handleSkip = useCallback(() => {
    // First, save any data that was entered before skipping
    saveCurrentImageData();

    // Then, mark the current image as skipped, making sure to include the latest form values
    const updatedImages = [...images];
    updatedImages[currentIndex] = {
      ...updatedImages[currentIndex],
      ...currentImageFormik.values, // This is crucial to save the latest unsaved data
      isSkipped: true,
      hasBeenEdited: true, // Mark as edited to track draft state
      isValid: false, // Skipped items are not valid for submission
    };
    onSave(updatedImages);
    
    // Check if this is the last image
    if (isOnLastImage) {
      // If it's the last image, trigger the new "skip and submit" flow
      // Pass the updated images array to avoid race condition with stale images prop
      triggerSkipAndSubmit(updatedImages);
    } else {
      // Move to next image
      onImageChange(currentIndex + 1);
    }
  }, [
    images,
    currentIndex,
    onSave,
    isOnLastImage,
    onImageChange,
    triggerSkipAndSubmit,
    saveCurrentImageData,
    currentImageFormik.values,
  ]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(currentIndex),
        },
      ]
    );
  }, [currentIndex, onDelete]);

  const handleClose = useCallback(() => {
    const hasUnsavedChanges = images.some(img => 
      !img.isSkipped && (img.hasBeenEdited || (currentImageFormik.dirty && currentIndex === images.indexOf(img)))
    );

    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Would you like to save them as a draft?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => onClose('manual'),
          },
          {
            text: 'Save Draft',
            onPress: () => {
              saveCurrentImageData();
              onClose('manual');
            },
          },
        ]
      );
    } else {
      onClose('manual');
    }
  }, [images, saveCurrentImageData, onClose]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={modalStyles.modalContainer}>
        <View style={modalStyles.container}>
          {/* Fixed Header */}
          <View style={modalStyles.header}>
            <TouchableOpacity
              style={modalStyles.backButton}
              onPress={handleClose}
            >
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>
              Edit Item ({currentIndex + 1} of {images.length})
            </Text>
          </View>

          {/* Fixed Stepper */}
          <HorizontalStepper
            steps={stepperData}
            currentStep={currentIndex}
            onStepPress={handleStepNavigation}
          />

          {/* Scrollable Content */}
          <ScrollView 
            style={modalStyles.scrollContent}
            contentContainerStyle={modalStyles.scrollContentContainer}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {/* Image Navigation */}
            {images.length > 0 && images[currentIndex] && (
              <ImageNavigation
                imageUri={images[currentIndex].imageUri}
                onPrevious={() => handleArrowNavigation('previous')}
                onNext={() => handleArrowNavigation('next')}
                onChangeImage={() => onReplaceImage(currentIndex)}
                showPrevious={currentIndex > 0}
                showNext={currentIndex < images.length - 1}
                imageIndex={currentIndex}
                totalImages={images.length}
              />
            )}

            {/* Form Section */}
            <View style={modalStyles.formSection}>
              <Text style={modalStyles.formTitle}>Item Description</Text>
              
                             {/* Brand */}
               <View style={modalStyles.fieldContainer}>
                 <SelectWithDrawer
                   value={currentImageFormik.values.brandId || 'Brand'}
                   onPress={() => setDrawerType('brand')}
                   error={
                     currentImageFormik.touched.selectedBrandId &&
                     currentImageFormik.errors.selectedBrandId
                   }
                   activeColor={currentImageFormik.values.selectedBrandId ? '#000' : undefined}
                   rightIcon={<Ionicons name="chevron-down" size={20} color="#6B7280" />}
                 />
               </View>

                             {/* Colour */}
               <View style={modalStyles.fieldContainer}>
                 <SelectWithDrawer
                   value={currentImageFormik.values.colourId || 'Colour'}
                   onPress={() => setDrawerType('colour')}
                   error={
                     currentImageFormik.touched.selectedColourId &&
                     currentImageFormik.errors.selectedColourId
                   }
                   activeColor={currentImageFormik.values.selectedColourId ? '#000' : undefined}
                   rightIcon={<Ionicons name="chevron-down" size={20} color="#6B7280" />}
                 />
               </View>

                             {/* Size */}
               <View style={modalStyles.fieldContainer}>
                 <SelectWithDrawer
                   value={currentImageFormik.values.sizeId || 'Size'}
                   onPress={() => setDrawerType('size')}
                   error={
                     currentImageFormik.touched.selectedSizeId &&
                     currentImageFormik.errors.selectedSizeId
                   }
                   activeColor={currentImageFormik.values.selectedSizeId ? '#000' : undefined}
                   rightIcon={<Ionicons name="chevron-down" size={20} color="#6B7280" />}
                 />
               </View>

                             {/* Category */}
               <View style={modalStyles.fieldContainer}>
                 <SelectWithDrawer
                   value={currentImageFormik.values.categoryId || 'Category'}
                   onPress={() => setDrawerType('category')}
                   error={
                     currentImageFormik.touched.selectedCategoryId &&
                     currentImageFormik.errors.selectedCategoryId
                   }
                   activeColor={currentImageFormik.values.selectedCategoryId ? '#000' : undefined}
                   rightIcon={<Ionicons name="chevron-down" size={20} color="#6B7280" />}
                 />
               </View>

                             {/* Season */}
               <View style={modalStyles.fieldContainer}>
                 <SelectWithDrawer
                   value={currentImageFormik.values.seasonId || 'Season'}
                   onPress={() => setDrawerType('season')}
                   error={
                     currentImageFormik.touched.selectedSeasonId &&
                     currentImageFormik.errors.selectedSeasonId
                   }
                   activeColor={currentImageFormik.values.selectedSeasonId ? '#000' : undefined}
                   rightIcon={<Ionicons name="chevron-down" size={20} color="#6B7280" />}
                 />
               </View>
            </View>
          </ScrollView>

          {/* Fixed Action Bar */}
          <ActionBar
            onSkip={handleSkip}
            onNext={handleNext}
            onDelete={handleDelete}
            isLastImage={isOnLastImage}
            isLoading={submissionState.status === 'submitting'}
          />

          {/* Loading Overlay */}
          {submissionState.status === 'uploading' && (
            <View style={modalStyles.loadingOverlay}>
              <View style={modalStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4313E" />
                <Text style={modalStyles.loadingText}>
                  Uploading your items...
                </Text>
                <Text style={modalStyles.loadingSubtext}>
                  Please don't close the app
                </Text>
              </View>
            </View>
          )}
          {submissionState.status === 'submitting' && (
            <View style={modalStyles.loadingOverlay}>
              <View style={modalStyles.loadingContainer}>
                <ActivityIndicator size="large" color="#D4313E" />
                <Text style={modalStyles.loadingText}>
                  Submitting your items...
                </Text>
                <Text style={modalStyles.loadingSubtext}>
                  Please don't close the app
                </Text>
              </View>
            </View>
          )}
          {submissionState.status === 'failed' && (
            <View style={modalStyles.loadingOverlay}>
              <View style={modalStyles.loadingContainer}>
                <Ionicons name="close-circle" size={40} color="#D4313E" />
                <Text style={modalStyles.loadingText}>
                  {submissionState.errorType === 'upload_error' ? 'Upload Failed' : 'Submission Failed'}
                </Text>
                <Text style={modalStyles.loadingSubtext}>
                  {submissionState.errorMessage || 
                    (submissionState.errorType === 'upload_error' 
                      ? 'Failed to upload images. Please check your internet connection.' 
                      : submissionState.uploadedRequestIds 
                        ? 'Images uploaded successfully but failed to save item details.'
                        : 'Failed to save items. Please try again.'
                    )
                  }
                </Text>
                <View style={modalStyles.errorButtonContainer}>
                  <TouchableOpacity
                    style={[modalStyles.retryButton, modalStyles.cancelButton]}
                    onPress={() => {
                      setSubmissionState({ 
                        status: 'idle', 
                        uploadedRequestIds: null, 
                        errorType: null, 
                        originatingHandler: null,
                        errorMessage: null 
                      });
                    }}
                  >
                    <Text style={[modalStyles.retryButtonText, modalStyles.cancelButtonText]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={modalStyles.retryButton}
                    onPress={() => {
                      if (submissionState.originatingHandler === 'final') {
                        handleFinalSubmission();
                      } else if (submissionState.originatingHandler === 'skip') {
                        handleSkipAndSubmit();
                      }
                    }}
                  >
                    <Text style={modalStyles.retryButtonText}>
                      {submissionState.uploadedRequestIds ? 'Retry Save' : 'Retry Upload'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Selection Modals - Inside SafeAreaView for proper layering */}
        {drawerType === 'brand' && (
          <SelectItemBrandModal
            isShow={true}
            onClose={() => setDrawerType(null)}
            name="brandId"
                         onSelect={(e: any) => {
               currentImageFormik.setFieldValue('brandId', e?.target?.value);
               currentImageFormik.setFieldValue('selectedBrandId', e?.target?.id);
               setDrawerType(null);
             }}
          />
        )}

        {drawerType === 'colour' && (
          <SelectItemColorModal
            isShow={true}
            onClose={() => setDrawerType(null)}
            name="colourId"
                         onSelect={(e: any) => {
               currentImageFormik.setFieldValue('colourId', e?.target?.value);
               currentImageFormik.setFieldValue('selectedColourId', e?.target?.id);
               setDrawerType(null);
             }}
          />
        )}

        {drawerType === 'size' && (
          <SelectItemSizeModal
            isShow={true}
            onClose={() => setDrawerType(null)}
            name="sizeId"
                         onSelect={(e: any) => {
               currentImageFormik.setFieldValue('sizeId', e?.target?.value);
               currentImageFormik.setFieldValue('selectedSizeId', e?.target?.id);
               setDrawerType(null);
             }}
          />
        )}

        {drawerType === 'category' && (
          <SelectItemCategoryModal
            isShow={true}
            onClose={() => setDrawerType(null)}
            name="categoryId"
                         onSelect={(e: any) => {
               currentImageFormik.setFieldValue('categoryId', e?.target?.value);
               currentImageFormik.setFieldValue('selectedCategoryId', e?.target?.id);
               setDrawerType(null);
             }}
          />
        )}

        {drawerType === 'season' && (
          <SelectSeasonModal
            isShow={true}
            onClose={() => setDrawerType(null)}
            name="seasonId"
            onSelect={(e: any) => {
              currentImageFormik.setFieldValue('seasonId', e?.target?.value);
              currentImageFormik.setFieldValue('selectedSeasonId', e?.target?.id);
              setDrawerType(null);
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default ImageDescriptionModal;
