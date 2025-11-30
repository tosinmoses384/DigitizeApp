import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import NewBottomModal from "@components/NewBottomModal";
import CustomButton from "@components/CustomButton";
import { useAppSelector } from "@redux/store";
import orderServices from "@services/features/orders/orderService";
import CustomToastNotification from "@helper/toast-message";
import { useShippingStatus } from "@hooks/use-shipping-status";
import EnhancedDropdown from "@components/EnhancedDropdown";

interface SetTrackingInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  messageDetails?: any;
}

const SetTrackingInfoModal: React.FC<SetTrackingInfoModalProps> = ({
  isVisible,
  onClose,
  onSuccess,
  messageDetails,
}) => {
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  const [isLoading, setIsLoading] = useState(false);
  const [toastDetails, setToastDetails] = useState<any>(null);

  const orderId = useMemo(
    () => messageDetails?.metadata?.order_id || '',
    [messageDetails]
  );

  const {
    statusOptions,
    isLoading: isLoadingOptions,
    isError: isOptionsError,
    error: optionsError,
  } = useShippingStatus({
    token: token || '',
    orderId,
    enabled: isVisible && !!token && !!orderId,
    refetchOnFocus: false,
  });

  const validationSchema = Yup.object().shape({
    status: Yup.string().required("Delivery status is required"),
  });


  const formik = useFormik({
    validationSchema,
    initialValues: {
      status: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      if (!token) {
        setToastDetails({
          message: "Authentication required",
          type: "error",
          duration: 4000,
        });
        return;
      }

      setIsLoading(true);
      setToastDetails(null);

      try {
        if (!orderId) {
          throw new Error("Order ID not found");
        }

        const selectedOption = statusOptions.find(opt => opt.value === values.status);
        const request = {
          status: selectedOption?.id || selectedOption?.key || '',
          description: selectedOption?.description || "",
        };

        const response = await orderServices.createShippingTrackingDetails(
          token,
          request,
          orderId
        );

        if (response.status === 200) {
          setToastDetails({
            message: response?.data?.message || "Tracking information updated successfully",
            type: "success",
            duration: 4000,
          });
          
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 1500);
        } else {
          setToastDetails({
            message: response?.data?.message || "Failed to update tracking information",
            type: "error",
            duration: 4000,
          });
        }
      } catch (error: any) {
        if (__DEV__) {
          console.error("Tracking update error:", error);
        }
        setToastDetails({
          message: error?.message || "An error occurred while updating tracking information",
          type: "error",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  const handleStatusChange = useCallback((value: string | number) => {
    formik.setFieldValue("status", value);
  }, [formik]);

  const handleClose = useCallback(() => {
    console.log('[SetTrackingInfoModal] Closing modal');
    if (!isLoading) {
      formik.resetForm();
      onClose();
    }
  }, [isLoading, formik, onClose]);

  useEffect(() => {
    if (isVisible) {
        console.log('[SetTrackingInfoModal] Visible', { orderId, statusOptionsCount: statusOptions?.length });
    }
  }, [isVisible, orderId, statusOptions]);

  if (!isVisible) return null;

  return (
    <>
      <NewBottomModal
        isShow={isVisible}
        onClose={handleClose}
        maxHeight={450}
      >
        <View style={styles.container}>
          <View style={styles.dragHandle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Set Tracking Information</Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              disabled={isLoading}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {isLoadingOptions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff3b4a" />
                <Text style={styles.loadingText}>Loading status options...</Text>
              </View>
            ) : isOptionsError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#ff3b4a" />
                <Text style={styles.errorText}>Failed to load status options</Text>
                <Text style={styles.errorSubtext}>
                  {(optionsError as any)?.message || "Please try again"}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.formGroup}>
                  <EnhancedDropdown
                    label="Delivery Status"
                    placeholder="Select delivery status"
                    value={formik.values.status}
                    options={statusOptions}
                    onChange={handleStatusChange}
                    error={formik.touched.status && formik.errors.status ? String(formik.errors.status) : undefined}
                    disabled={isLoading || isLoadingOptions}
                    loading={isLoadingOptions}
                    searchable={true}
                    searchPlaceholder="Search status..."
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <CustomButton
                    title={isLoading ? "Updating..." : "Update Tracking"}
                    buttonStyle={[
                      styles.updateButton,
                      (!formik.isValid || isLoading || isLoadingOptions) && styles.updateButtonDisabled,
                    ]}
                    textStyle={styles.updateButtonText}
                    onPress={formik.handleSubmit}
                    disabled={!formik.isValid || isLoading || isLoadingOptions}
                  />
                </View>
              </>
            )}
          </View>
        </View>

        {toastDetails && (
          <View style={styles.toastContainer}>
            <CustomToastNotification
              message={toastDetails.message}
              type={toastDetails.type}
              autoHideDuration={toastDetails.duration}
            />
          </View>
        )}
      </NewBottomModal>
    </>
  );
};

export default SetTrackingInfoModal;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E9EAEB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EAEB",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    color: "#07090c",
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  dropdownContainer: {
    marginBottom: 0,
  },
  buttonContainer: {
    marginTop: 32,
    paddingTop: 16,
  },
  updateButton: {
    backgroundColor: "#ff3b4a",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  updateButtonDisabled: {
    backgroundColor: "#FFD8DB",
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "DMSans-SemiBold",
  },
  toastContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontFamily: "DMSans-Bold",
    color: "#07090c",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#666",
    textAlign: "center",
  },
});
