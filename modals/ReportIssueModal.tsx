import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import AppTextInput from "@components/AppTextInput";
import CustomDropdown, { DropdownOption } from "@components/CustomDropdown";
import CustomButton from "@components/CustomButton";
import { useOptimizedImagePicker } from "@hooks/useOptimizedImagePicker";
import { useAppSelector } from "@redux/store";
import orderServices from "@services/features/orders/orderService";
import fileServerServices from "@services/features/file-server/fileServer";
import { generateGUID } from "@helper/guid-number";
import { router } from "expo-router";
import CustomToastNotification from "@helper/toast-message";
import { Ionicons } from "@expo/vector-icons";
import { SIZES } from "@constants/Colors";

/**
 * Validates if a string is a valid GUID format
 * @param guid - String to validate
 * @returns boolean indicating if the string is a valid GUID
 */
const isValidGUID = (guid: string): boolean => {
  if (!guid || typeof guid !== "string") {
    return false;
  }
  const guidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidRegex.test(guid);
};

interface ReportIssueModalProps {
  isVisible: boolean;
  onClose: () => void;
  orderId: string;
  requestId: string;
}

interface Classification {
  id: number;
  name: string;
  description?: string;
}

interface ToastDetails {
  message: string;
  type: "success" | "error" | "info";
}

const ReportIssueModal = ({
  isVisible,
  onClose,
  orderId,
  requestId,
}: ReportIssueModalProps) => {
  const { token } = useAppSelector((state) => state?.userProfileSlice);

  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loadingClassifications, setLoadingClassifications] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState("");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [localImageUri, setLocalImageUri] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastDetails, setToastDetails] = useState<ToastDetails | null>(null);

  const {
    pickImageFromGallery,
    isProcessing,
    processingProgress,
    error: pickerError,
    clearError: clearPickerError,
  } = useOptimizedImagePicker({
    maxFileSize: 1.9 * 1024 * 1024,
    maxResolution: null,
    quality: 0.9,
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
      maxRetryAttempts: null,
      enableParameterAdjustment: true,
      timeoutMs: 30000,
    },
  });

  const fetchClassifications = useCallback(async () => {
    setLoadingClassifications(true);
    try {
      const response = await orderServices.getOrderDisputeClassifications();
      if (response?.status === 200 && response?.data) {
        setClassifications(response.data);
      } else {
        setToastDetails({
          message: "Failed to load issue types. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error fetching classifications:", error);
      }
      setToastDetails({
        message: "Failed to load issue types. Please try again.",
        type: "error",
      });
    } finally {
      setLoadingClassifications(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setSelectedClassification("");
    setDisputeDetails("");
    setUploadedImageUrl("");
    setLocalImageUri("");
    setToastDetails(null);
  }, []);

  useEffect(() => {
    if (isVisible) {
      // Validate IDs when modal opens
    //   if (!isValidGUID(requestId) || !isValidGUID(orderId)) {
    //     setToastDetails({
    //       message:
    //         "Invalid order or request information. Unable to report issue at this time.",
    //       type: "error",
    //     });
    //   }
      fetchClassifications();
    } else {
      resetForm();
    }
  }, [isVisible, fetchClassifications, resetForm, requestId, orderId]);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await pickImageFromGallery();

      if (result) {
        setLocalImageUri(result.uri);

        const getGuid = generateGUID();
        const isAndroid = Platform.OS === "android";

        const imageData = [
          {
            uri: result.uri,
            type: "image",
            mimeType: `image/${result.format}`,
            fileName: `image.${result.format}`,
          },
        ];

        const uploadResponse = await fileServerServices.postConversationImageUpload(
          imageData,
          isAndroid,
          getGuid,
          token
        );

        if (uploadResponse?.status === 200) {
          const serverImageUrl = (uploadResponse.data as any)?.[0]?.resourceUrl;
          setUploadedImageUrl(serverImageUrl);
        } else if (uploadResponse?.responseCode === 401) {
          router.push("/Onboarding");
        } else {
          setToastDetails({
            message: "Failed to upload image. Please try again.",
            type: "error",
          });
          setLocalImageUri("");
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error uploading image:", error);
      }
      if (pickerError) {
        setToastDetails({
          message: pickerError.message || "Failed to process image.",
          type: "error",
        });
        clearPickerError();
      }
      setLocalImageUri("");
    }
  }, [pickImageFromGallery, pickerError, clearPickerError, token]);

  const handleRemoveImage = useCallback(() => {
    setLocalImageUri("");
    setUploadedImageUrl("");
  }, []);

  const isFormValid = useMemo(() => {
    return (
      selectedClassification.trim() !== "" &&
      disputeDetails.trim() !== "" &&
      disputeDetails.trim().length >= 10
    );
  }, [selectedClassification, disputeDetails]);

  const validateForm = useCallback(() => {
    if (!selectedClassification) {
      setToastDetails({
        message: "Please select an issue type",
        type: "error",
      });
      return false;
    }

    if (!disputeDetails.trim()) {
      setToastDetails({
        message: "Please provide details of the issue",
        type: "error",
      });
      return false;
    }

    if (disputeDetails.trim().length < 10) {
      setToastDetails({
        message: "Please provide more details about the issue (minimum 10 characters)",
        type: "error",
      });
      return false;
    }

    return true;
  }, [selectedClassification, disputeDetails]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    // Generate requestId if empty (fallback for missing metadata)
    const finalRequestId = requestId.trim() !== "" ? requestId : generateGUID();

    // Validate requestId is a proper GUID
    if (!isValidGUID(finalRequestId)) {
      setToastDetails({
        message: "Invalid request ID format. Please try again or contact support.",
        type: "error",
      });
      return;
    }

    // Validate orderId is a proper GUID
    if (!isValidGUID(orderId)) {
      setToastDetails({
        message: "Invalid order ID format. Please try again or contact support.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setToastDetails(null);

    try {
      const selectedItem = classifications.find(
        (item) => item.name === selectedClassification
      );

      const disputePayload: {
        requestId: string;
        orderId: string;
        dispute: string;
        classification: string;
        imageUrl?: string;
      } = {
        requestId: finalRequestId,
        orderId,
        dispute: disputeDetails.trim(),
        classification: selectedItem?.id.toString() || selectedClassification,
      };

      // Include image URL if uploaded
      if (uploadedImageUrl) {
        disputePayload.imageUrl = uploadedImageUrl;
      }

      const response = await orderServices.createOrderDispute(disputePayload);

      if (response?.status === 200) {
        setToastDetails({
          message: "Issue reported successfully. We'll review it shortly.",
          type: "success",
        });

        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else if (response?.responseCode === 401) {
        router.push("/Onboarding");
      } else {
        setToastDetails({
          message:
            response?.detail ||
            response?.message ||
            "Failed to submit report. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error submitting dispute:", error);
      }
      setToastDetails({
        message: "Failed to submit report. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    requestId,
    orderId,
    disputeDetails,
    selectedClassification,
    classifications,
    uploadedImageUrl,
    onClose,
    resetForm,
  ]);

  const classificationOptions: DropdownOption[] = useMemo(
    () =>
      classifications.map((item) => ({
        key: item.id.toString(),
        value: item.name,
        label: item.name,
        description: item.description,
      })),
    [classifications]
  );

  const handleClassificationChange = useCallback((value: string | number) => {
    setSelectedClassification(value.toString());
  }, []);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
        {toastDetails && (
          <View style={styles.toastContainer}>
            <CustomToastNotification
              message={toastDetails.message}
              type={toastDetails.type}
              autoHideDuration={3000}
            />
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.backButton}
            accessibilityLabel="Close modal"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#07090C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report an Issue</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Report an issue</Text>
          <Text style={styles.subtitle}>
            Please fill the form below to report an issue with your order
          </Text>


          <View style={styles.formSection}>
            <CustomDropdown
              label="Select Issue"
              placeholder="Select Issue"
              value={selectedClassification}
              options={classificationOptions}
              onChange={handleClassificationChange}
              loading={loadingClassifications}
              searchable
              searchPlaceholder="Search issue types..."
              emptyText="No issue types available"
              loadingText="Loading issue types..."
              mode="local"
              maxHeight={350}
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>Details of issue</Text>
            <AppTextInput
              value={disputeDetails}
              onChangeText={setDisputeDetails}
              placeholder="Details of issue"
              isMultiline
              multilineHeight={120}
              inputStyle={styles.textArea}
              placeholderTextColor="#90959E"
            />
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Add image Evidence</Text>

            {localImageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: localImageUri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <Pressable
                  style={({ pressed }) => [
                    styles.removeImageButton,
                    pressed && styles.removeImageButtonPressed,
                  ]}
                  onPress={handleRemoveImage}
                  accessibilityLabel="Remove image"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={18} color="#FFFFFF" />
                </Pressable>
                {isProcessing && (
                  <View style={styles.processingOverlay}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.processingText}>
                      Processing... {Math.round(processingProgress * 100)}%
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickImage}
                disabled={isProcessing}
                accessibilityLabel="Upload image from gallery"
                accessibilityRole="button"
              >
                <Ionicons
                  name="image-outline"
                  size={24}
                  color="#6B727E"
                  style={styles.uploadIcon}
                />
                <Text style={styles.uploadButtonText}>
                  {isProcessing ? "Processing..." : "Upload from gallery"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <CustomButton
            title="Send Report"
            onPress={handleSubmit}
            loader={isSubmitting}
            showLoadingText
            disabled={!isFormValid || isSubmitting}
            buttonStyle={
              !isFormValid || isSubmitting
                ? styles.submitButtonDisabled
                : styles.submitButton
            }
            textStyle={
              !isFormValid || isSubmitting
                ? styles.submitButtonTextDisabled
                : styles.submitButtonText
            }
          />
        </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default ReportIssueModal;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  toastContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 0 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAEB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "DMSans-Bold",
    color: "#07090C",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    color: "#07090C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#6B727E",
    lineHeight: 20,
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#07090C",
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: "#F7F8F9",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#07090C",
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#07090C",
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: 12,
    borderStyle: "solid",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  uploadIcon: {
    marginRight: 4,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#6B727E",
  },
  imagePreviewContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F7F8F9",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  removeImageButtonPressed: {
    opacity: 0.7,
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  processingText: {
    color: "white",
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#E9EAEB",
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 32,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  submitButtonTextDisabled: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    color: "#90959E",
    textAlign: "center",
  },
});

