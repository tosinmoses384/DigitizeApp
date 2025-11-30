import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Modal,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import AppTextInput from "@components/AppTextInput";
import CustomButton from "@components/CustomButton";
import { Ionicons } from "@expo/vector-icons";
import wardrobeServices from "@services/features/wardrobe-service/wardrobeServices";
import { useAppSelector } from "@redux/store";
import { router } from "expo-router";

interface LeaveReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  orderId: string;
  requestId: string;
  trifterId: string;
  sellerName?: string;
  metaData?: {
    product_image_url?: string;
    product_name?: string;
    product_amount?: string;
    product_currency_symbol?: string;
    product_size?: string;
  };
  maxRating?: number;
  starSize?: number;
}

interface ToastDetails {
  message: string;
  type: "success" | "error" | "info";
}

const LeaveReviewModal = ({
  isVisible,
  onClose,
  orderId,
  requestId,
  trifterId,
  sellerName,
  metaData,
  maxRating = 5,
  starSize = 12,
}: LeaveReviewModalProps) => {
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastDetails, setToastDetails] = useState<ToastDetails | null>(null);

  const resetForm = useCallback(() => {
    setRating(0);
    setReviewText("");
    setToastDetails(null);
  }, []);

  const handleRatingPress = useCallback((selectedRating: number) => {
    setRating(selectedRating);
    // Clear error toast when user selects a rating
    if (toastDetails?.type === "error") {
      setToastDetails(null);
    }
  }, [toastDetails]);

  const isFormValid = useMemo(() => {
    return rating > 0;
  }, [rating]);

  // Clear error toast when form becomes valid
  useEffect(() => {
    if (toastDetails?.type === "error") {
      // Clear error if rating is selected
      if (rating > 0) {
        // Check if text validation is also passed (if text is provided)
        if (!reviewText.trim() || reviewText.trim().length >= 10) {
          setToastDetails(null);
        }
      }
    }
  }, [rating, reviewText, toastDetails]);

  const validateForm = useCallback(() => {
    if (rating === 0) {
      setToastDetails({
        message: "Please select a rating",
        type: "error",
      });
      return false;
    }

    // If user provides text, it should meet minimum length requirement
    if (reviewText.trim() && reviewText.trim().length < 10) {
      setToastDetails({
        message: "Please provide more detailed feedback (minimum 10 characters) or leave the text field empty",
        type: "error",
      });
      return false;
    }

    return true;
  }, [rating, reviewText]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!token) {
      setToastDetails({
        message: "Authentication required. Please log in again.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setToastDetails(null);

    try {
      const response = await wardrobeServices.submitReview(
        trifterId,
        {
          ratings: rating,
          review: reviewText.trim(),
        },
        token
      );

      if (response?.status === 200 || response?.responseCode === "200") {
        setToastDetails({
          message: "Review submitted successfully. Thank you for your feedback!",
          type: "success",
        });

        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else if (response?.responseCode === "401") {
        router.push("/Onboarding");
      } else {
        setToastDetails({
          message: response?.message || "Failed to submit review. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error submitting review:", error);
      }
      setToastDetails({
        message: "Failed to submit review. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, trifterId, rating, reviewText, token, onClose, resetForm]);

  const renderStars = () => {
    return Array.from({ length: maxRating }, (_, index) => {
      const starNumber = index + 1;
      const isFilled = starNumber <= rating;
      
      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleRatingPress(starNumber)}
          style={styles.starButton}
          accessibilityLabel={`Rate ${starNumber} star${starNumber > 1 ? 's' : ''}`}
          accessibilityRole="button"
        >
          <Ionicons
            name={isFilled ? "star" : "star-outline"}
            size={starSize}
            color={isFilled ? "#232323" : "#D3D5D8"}
          />
        </TouchableOpacity>
      );
    });
  };

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
                <View style={[
                  styles.toast,
                  toastDetails.type === "success" ? styles.toastSuccess : styles.toastError
                ]}>
                  <Text style={styles.toastText}>{toastDetails.message}</Text>
                </View>
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
              <Text style={styles.headerTitle}>Leave Feedback</Text>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                style={[
                  styles.sendButton,
                  (!isFormValid || isSubmitting) && styles.sendButtonDisabled
                ]}
                accessibilityLabel="Send review"
                accessibilityRole="button"
              >
                <Text style={[
                  styles.sendButtonText,
                  (!isFormValid || isSubmitting) && styles.sendButtonTextDisabled
                ]}>
                  Send
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              {/* Product/User Information Section - Same as MakeOfferCard */}
              <View style={styles.productInfoCard}>
                <View style={styles.productImageContainer}>
                  {metaData?.product_image_url ? (
                    <Image
                      source={{ uri: metaData.product_image_url }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="home-outline" size={24} color="#D3D5D8" />
                    </View>
                  )}
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productTitle}>
                    {metaData?.product_name || "Product"}
                    {metaData?.product_size && `, ${metaData.product_size}`}
                  </Text>
                  <Text style={styles.productPrice}>
                    Price: {metaData?.product_amount && metaData?.product_currency_symbol 
                      ? `${metaData.product_currency_symbol.toUpperCase()} ${metaData.product_amount}` 
                      : "N/A"}
                  </Text>
                </View>
              </View>

              {/* Rating Section */}
              <View style={styles.ratingSection}>
                <View style={styles.starsContainer}>
                  {renderStars()}
                </View>
                <Text style={styles.rateText}>Rate</Text>
              </View>

              {/* Feedback Input Section */}
              <View style={styles.feedbackSection}>
                <AppTextInput
                  value={reviewText}
                  onChangeText={setReviewText}
                  placeholder="How was your experience with this trifter? (Optional)"
                  isMultiline
                  multilineHeight={120}
                  inputStyle={styles.feedbackInput}
                  placeholderTextColor="#90959E"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default LeaveReviewModal;

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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  toastSuccess: {
    backgroundColor: "#D4EDDA",
  },
  toastError: {
    backgroundColor: "#F8D7DA",
  },
  toastText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#155724",
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
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "DMSans-Medium",
    color: "#07090C",
  },
  sendButtonTextDisabled: {
    color: "#90959E",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  productInfoCard: {
    flexDirection: "row",
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9EAEB",
  },
  productImageContainer: {
    height: 52,
    width: 52,
    backgroundColor: "#E9EAEB",
    borderRadius: 12,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E9EAEB",
    justifyContent: "center",
    alignItems: "center",
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    color: "#071827",
    textTransform: "capitalize",
    marginBottom: 4,
    fontFamily: "DMSans-Medium",
  },
  productPrice: {
    fontSize: 12,
    color: "#5C6F7F",
    marginBottom: 4,
    fontFamily: "DMSans-Medium",
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F7F8F9",
    borderRadius: 12,
    gap: 6,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    maxWidth: "100%",
    overflow: "hidden",
  },
  starButton: {
    padding: 0,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  rateText: {
    fontSize: 10,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    color: "#232323",
    textAlign: "left",
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9EAEB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: "#07090C",
    textAlignVertical: "top",
    minHeight: 120,
  },
});
