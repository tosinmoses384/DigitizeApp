import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { ActivityComponentProps } from "../types";
import { useAppSelector } from "@redux/store";
import orderServices from "@services/features/orders/orderService";
import { router } from "expo-router";
import CustomToastNotification from "@helper/toast-message";

interface ToastDetails {
  message: string;
  type: "success" | "error" | "info";
}

/**
 * ShippingDropOffConfirmationActivity Component
 * 
 * Displays a confirmation card for sellers to confirm they have dropped off 
 * the package at the designated drop-off point.
 * 
 * Following DigitizeApp Coding Standards:
 * - Functional component with TypeScript
 * - Performance: useCallback for memoized callbacks
 * - Proper error handling with try/catch
 * - Accessibility labels on interactive elements
 * - StyleSheet.create for all styles
 * - Async/await for API calls
 */
const ShippingDropOffConfirmationActivity = ({
  message,
  profileId,
  isSeller = false,
}: ActivityComponentProps) => {
  const metadata = message?.metadata;
  const { token } = useAppSelector((state) => state?.userProfileSlice);
  
  const [confirmLoader, setConfirmLoader] = useState(false);
  const [toastDetails, setToastDetails] = useState<ToastDetails | null>(null);
  const [isDropOffConfirmed, setIsDropOffConfirmed] = useState(false);
  
  // Check if already confirmed or inactive
  const isActive = metadata?.is_active === "True";
  const isConfirmed = metadata?.is_active === "False" || isDropOffConfirmed;

  /**
   * Handles confirmation of package drop-off
   * Follows async/await pattern for API calls as per coding guide
   */
  const handleConfirmDropOff = useCallback(async () => {
    setToastDetails(null);
    setConfirmLoader(true);

    try {
      // Call the confirmDropOff endpoint
      // Backend team: Please implement this endpoint at PUT /orders/v1/orders/{orderId}/shipping/confirm-dropoff
      const response = await orderServices.confirmDropOff(
        metadata?.order_id
      );

      setConfirmLoader(false);
      
      if (response?.status === 200) {
        setIsDropOffConfirmed(true);
        setToastDetails({
          message: "Drop-off confirmed successfully",
          type: "success",
        });
        return;
      }

      if (response?.responseCode === 401) {
        return router.push("/Onboarding");
      }
      
      setToastDetails({
        message: response?.detail || response?.message || "Failed to confirm drop-off",
        type: "error",
      });
    } catch (error) {
      setConfirmLoader(false);
      setToastDetails({
        message: "Failed to confirm drop-off. Please try again.",
        type: "error",
      });
    }
  }, [metadata]);

  // Only show for seller
  if (!isSeller) {
    return null;
  }

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
          <Text style={styles.title}>
            {metadata?.title || "Have you taken your package to the Drop-off Point?"}
          </Text>
          <Text style={styles.description}>
            {message?.content || "Please let us know if you have taken your package to the drop-off point"}
          </Text>
          <View style={styles.buttonsContainer}>
            {isConfirmed ? (
              <View style={[styles.confirmButton, styles.confirmedButton]}>
                <Text style={styles.confirmedText}>
                  Package Dropped Off
                </Text>
              </View>
            ) : (
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [
                  styles.confirmButton,
                  pressed && styles.pressedButton,
                  (confirmLoader || !isActive) && styles.disabledButton,
                ]}
                onPress={handleConfirmDropOff}
                disabled={confirmLoader || !isActive}
                accessibilityLabel="Confirm package drop-off"
                accessibilityRole="button"
                accessibilityState={{ disabled: !isActive || confirmLoader }}
              >
                <Text style={[
                  styles.confirmButtonText,
                  !isActive && styles.disabledButtonText,
                ]}>
                  {confirmLoader ? "Confirming..." : "I've dropped off the package"}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

export default ShippingDropOffConfirmationActivity;

/**
 * Styles following DigitizeApp design system
 * - Using StyleSheet.create as per coding guide
 * - Consistent spacing and typography
 * - Proper color contrast for accessibility
 */
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
    padding: 16,
    gap: 12,
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
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#212C3D",
    borderStyle: "solid",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    color: "#212C3D",
    textAlign: "center",
    lineHeight: 18,
  },
  confirmedButton: {
    backgroundColor: "#E9EAEB",
    borderColor: "#E9EAEB",
  },
  confirmedText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    color: "#464F5D",
    textAlign: "center",
    lineHeight: 18,
  },
  pressedButton: {
    opacity: 0.7,
  },
  disabledButton: {
    opacity: 0.6,
    borderColor: "#E9EAEB",
    backgroundColor: "#F5F5F5",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
});

