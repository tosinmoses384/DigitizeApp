import CustomButton from "@components/CustomButton";
import { formatAmount } from "@helper/formatCash";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";
import SetTrackingInfoModal from "@modals/SetTrackingInfoModal";

interface ShippingStatusConfig {
  title: string;
  description: string;
  buttonText: string;
}

const SHIPPING_STATUS_CONFIG: Record<string, ShippingStatusConfig> = {
  "NotShipped": {
    title: "Not Shipped",
    description: "The order has been placed but the item has not been shipped yet. Please prepare the item for shipment and update the tracking information once it's ready to be sent.",
    buttonText: "Update Tracking information"
  },
  "Shipped": {
    title: "Shipping Confirmed",
    description: "Shipping has been confirmed and the product is being processed by the delivery or shipping company. Please update the tracking information to let the buyer know of the delivery status.",
    buttonText: "Update Tracking information"
  },
  "InTransit": {
    title: "In Transit",
    description: "The package is currently in transit and on its way to the destination. You can update the tracking information to provide the latest delivery status to the buyer.",
    buttonText: "Update Tracking information"
  },
  "PreparingForShipment": {
    title: "Preparing for Shipment",
    description: "The order is being prepared for shipment. Please update the tracking information once the item is ready to be sent to the buyer.",
    buttonText: "Update Tracking information"
  },
  "ShippingIssue": {
    title: "Shipping Issue",
    description: "There has been an issue with the shipping process. Please update the tracking information with the current status and any relevant details for the buyer.",
    buttonText: "Update Tracking information"
  },
  "ReturningToSender": {
    title: "Returning to Sender",
    description: "The package is being returned to the sender. Please update the tracking information to inform the buyer about the return status and next steps.",
    buttonText: "Update Tracking information"
  }
};

const UpdateTrackingInfoActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const metadata = message?.metadata;
  const disabled = metadata?.is_active === "False";
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const statusConfig = useMemo(() => {
    const shippingStatus = metadata?.shipping_status;
    const title = metadata?.title;
    
    if (title && SHIPPING_STATUS_CONFIG[title]) {
      return SHIPPING_STATUS_CONFIG[title];
    }
    
    if (shippingStatus && SHIPPING_STATUS_CONFIG[shippingStatus]) {
      return SHIPPING_STATUS_CONFIG[shippingStatus];
    }
    
    return SHIPPING_STATUS_CONFIG["Shipped"];
  }, [metadata?.shipping_status, metadata?.title]);

  const handleUpdateTracking = () => {
    if (!disabled) {
      setShowTrackingModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowTrackingModal(false);
  };

  const handleTrackingSuccess = () => {
    setShowTrackingModal(false);
  };

  return (
    <>
      <View
        style={[
          styles.messageContainer,
          message?.isMine ? styles.myMessage : styles.theirMessage,
        ]}
        accessibilityLabel={`Shipping status: ${statusConfig.title}`}
      >
        <Text 
          style={styles.shippingConfirmed}
          accessibilityRole="header"
        >
          {statusConfig.title}
        </Text>
        <Text style={styles.shippingDescription}>
          {statusConfig.description}
        </Text>
        <View style={styles.buttonsWrapper}>
          {disabled ? (
            <View 
              style={[styles.updateTrackingButton, styles.updateTrackingButtonDisabled]}
              accessibilityRole="button"
              accessibilityLabel={`${statusConfig.buttonText} (disabled)`}
              accessibilityState={{ disabled: true }}
            >
              <Text style={[styles.updateTrackingButtonText, styles.updateTrackingButtonTextDisabled]}>
                {statusConfig.buttonText}
              </Text>
            </View>
          ) : (
            <CustomButton
              title={statusConfig.buttonText}
              buttonStyle={styles.updateTrackingButton}
              textStyle={styles.updateTrackingButtonText}
              onPress={handleUpdateTracking}
            />
          )}
        </View>
      </View>

      <SetTrackingInfoModal
        isVisible={showTrackingModal}
        onClose={handleCloseModal}
        onSuccess={handleTrackingSuccess}
        messageDetails={message}
      />
    </>
  );
};

export default UpdateTrackingInfoActivity;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    gap: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    borderColor: "#E9EAEB",
    borderWidth: 2,
    backgroundColor: "#FFF7F8",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#E9EAEB",
    borderWidth: 2,
  },
  shippingConfirmed: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    color: "#07090c",
    textAlign: "left",
    alignSelf: "stretch",
  },
  shippingDescription: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#464f5d",
    textAlign: "left",
    alignSelf: "stretch",
    lineHeight: 20,
  },
  buttonsWrapper: {
    alignSelf: "stretch",
  },
  updateTrackingButton: {
    borderRadius: 12,
    backgroundColor: "#ff3b4a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "stretch",
  },
  updateTrackingButtonText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 18,
  },
  // Disabled styles
  updateTrackingButtonDisabled: {
    backgroundColor: "#FFD8DB",
  },
  updateTrackingButtonTextDisabled: {
    color: "#FF9DA4",
  },
});
