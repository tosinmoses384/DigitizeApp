import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { ActivityComponentProps } from "../types";
import { useAppSelector } from "@redux/store";
import orderServices from "@services/features/orders/orderService";
import { router } from "expo-router";
import CustomToastNotification from "@helper/toast-message";
import ReportIssueModal from "@modals/ReportIssueModal";

interface ToastDetails {
  message: string;
  type: "success" | "error" | "info";
}

const DeliveryConfirmationActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const metadata = message?.metadata;
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  
  const [confirmLoader, setConfirmLoader] = useState(false);
  const [toastDetails, setToastDetails] = useState<ToastDetails | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isDeliveryConfirmed, setIsDeliveryConfirmed] = useState(false);
  const isConfirmed = metadata?.is_active === "False" || isDeliveryConfirmed;

  const handleConfirmDelivery = useCallback(async () => {
    setToastDetails(null);
    setConfirmLoader(true);

    try {
      const response = await orderServices.confirmDelivery(
        metadata?.order_id
      );

      setConfirmLoader(false);
      
      if (response?.status === 200) {
        setIsDeliveryConfirmed(true);
        setToastDetails({
          message: "Delivery confirmed successfully",
          type: "success",
        });
        return;
      }

      if (response?.responseCode === 401) {
        return router.push("/Onboarding");
      }
      
      setToastDetails({
        message: response?.detail || response?.message || "Failed to confirm delivery",
        type: "error",
      });
    } catch (error) {
      setConfirmLoader(false);
      setToastDetails({
        message: "Failed to confirm delivery. Please try again.",
        type: "error",
      });
    }
  }, [metadata]);

  const handleReportIssue = useCallback(() => {
    setShowReportModal(true);
  }, []);

  const handleCloseReportModal = useCallback(() => {
    setShowReportModal(false);
  }, []);

  return (
    <>
      {toastDetails && (
        <CustomToastNotification
          message={toastDetails.message}
          type={toastDetails.type}
          autoHideDuration={3000}
        />
      )}
      <View
        style={[
          styles.messageContainer,
          message?.isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Delivered</Text>
          <Text style={styles.description}>
            The seller has confirmed delivery of the package. Please confirm you got the package.
          </Text>
          <View style={styles.buttonsContainer}>
            {isConfirmed ? (
              <View style={[styles.confirmButton, styles.confirmedButton]}>
                <Text style={styles.confirmedText}>
                  Package Delivered
                </Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.confirmButton,
                  pressed && styles.pressedButton,
                  confirmLoader && styles.disabledButton,
                ]}
                onPress={handleConfirmDelivery}
                disabled={confirmLoader}
                accessibilityLabel="Confirm package delivery"
                accessibilityRole="button"
              >
                <Text style={styles.confirmButtonText}>
                  {confirmLoader ? "Confirming..." : "I got the package"}
                </Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }: { pressed: boolean }) => [
                styles.reportButton,
                pressed && styles.pressedButton,
              ]}
              onPress={handleReportIssue}
              accessibilityLabel="Report an issue with delivery"
              accessibilityRole="button"
            >
              <Text style={styles.reportButtonText}>Report an issue</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ReportIssueModal
        isVisible={showReportModal}
        onClose={handleCloseReportModal}
        orderId={metadata?.order_id || ""}
        requestId={metadata?.request_id || ""}
      />
    </>
  );
};

export default DeliveryConfirmationActivity;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "85%",
    marginVertical: 4,
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  theirMessage: {
    alignSelf: "flex-start",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9EAEB",
    padding: 10,
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    color: "#07090C",
    textAlign: "left",
  },
  description: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#464F5D",
    textAlign: "left",
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 8,
    alignSelf: "stretch",
  },
  confirmButton: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "DMSans-Bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
  },
  confirmedButton: {
    backgroundColor: "#E9EAEB",
  },
  confirmedText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: "DMSans-Bold",
    color: "#464F5D",
    textAlign: "center",
    lineHeight: 24,
  },
  reportButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    color: "#FF3B4A",
    textAlign: "center",
    lineHeight: 18,
  },
  pressedButton: {
    opacity: 0.7,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

