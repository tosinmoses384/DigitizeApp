import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import CustomButton from "@components/CustomButton";
import ShippingInstructionsModal from "../../modals/shipping-instructions-modal";
import DigitalShippingLabelModal from "../../modals/digital-shipping-label-modal";
import { ActivityComponentProps } from "../types";
import { useI18n } from "@hooks/use-i18n";
import { useAppSelector } from "@redux/store";

/**
 * ShippingLabelActivity Component
 * 
 * Displayed after a shipping label has been generated successfully.
 * Provides the seller with:
 * - Instructions to pack and ship the order
 * - Access to the digital shipping label (PDF)
 * - Access to detailed shipping instructions
 * 
 * @section Architecture Requirements - Components layer (message templates)
 * @section Performance - Uses React.memo and useCallback for optimization
 */
const ShippingLabelActivity = ({
  message,
  profileId,
  isSeller,
}: ActivityComponentProps) => {
  const { t } = useI18n();
  const metadata = message?.metadata;
  const disabled = metadata?.is_active === "False";

  // Get order data from Redux store (same source as the top order card)
  const { metaData, currentChatName } = useAppSelector((state) => state.userProfileSlice);

  // Local state for modals visibility
  const [isInstructionsModalVisible, setIsInstructionsModalVisible] = useState(false);
  const [isDigitalLabelModalVisible, setIsDigitalLabelModalVisible] = useState(false);

  // Extract data from metadata
  const title = metadata?.title || t("shipping.packAndSendTitle");
  const shippingLabelUrl = metadata?.shipping_label_url;
  const shippingProvider = metadata?.shipping_provider;
  const shippingType = metadata?.shipping_type || "Platform";
  const trackingCode = metadata?.tracking_code || metadata?.tracking_number;
  const messageContent = message?.content || "";

  // Extract order details from metaData (same as displayed in top card)
  const itemName = metaData?.product_name || "";
  const itemSize = metaData?.product_size || "";
  const itemImage = metaData?.product_image_url || "";
  const itemPrice = metaData?.product_amount || "";
  const currencySymbol = metaData?.product_currency_symbol || "";
  
  // Format full item display name
  const fullItemName = itemSize ? `${itemName}, ${itemSize}` : itemName;

  /**
   * Handler to open the digital shipping label modal
   * Opens a full-page modal with QR code and shipping details
   * 
   * @section User Experience - Shows comprehensive label information
   */
  const handleOpenDigitalLabel = useCallback(() => {
    setIsDigitalLabelModalVisible(true);
  }, []);

  /**
   * Handler to show shipping instructions modal
   * Opens a full-page modal with detailed shipping instructions
   * 
   * @section User Experience - Shows comprehensive shipping guidance
   */
  const handleShowShippingInstructions = useCallback(() => {
    setIsInstructionsModalVisible(true);
  }, []);

  return (
    <View
      style={[
        styles.messageContainer,
        message?.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Message content with instructions */}
      {messageContent ? (
        <Text style={styles.description}>{messageContent}</Text>
      ) : null}

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        {/* Primary Button - Open Digital Label */}
        {disabled ? (
          <View
            style={[
              styles.primaryButton,
              styles.primaryButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                styles.primaryButtonTextDisabled,
              ]}
            >
              {t("shipping.openDigitalLabel")}
            </Text>
          </View>
        ) : (
          <CustomButton
            title={t("shipping.openDigitalLabel")}
            buttonStyle={styles.primaryButton}
            textStyle={styles.primaryButtonText}
            onPress={handleOpenDigitalLabel}
            accessibilityLabel={t("shipping.openDigitalLabelAccessibility")}
            accessibilityRole="button"
          />
        )}

        {/* Secondary Button - Shipping Instructions */}
        {disabled ? (
          <View
            style={[
              styles.secondaryButton,
              styles.secondaryButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.secondaryButtonText,
                styles.secondaryButtonTextDisabled,
              ]}
            >
              {t("shipping.shippingInstructions")}
            </Text>
          </View>
        ) : (
          <CustomButton
            title={t("shipping.shippingInstructions")}
            buttonStyle={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
            onPress={handleShowShippingInstructions}
            accessibilityLabel={t("shipping.shippingInstructionsAccessibility")}
            accessibilityRole="button"
          />
        )}
      </View>

      {/* Digital Shipping Label Modal */}
      <DigitalShippingLabelModal
        visible={isDigitalLabelModalVisible}
        onClose={() => setIsDigitalLabelModalVisible(false)}
        shippingLabelUrl={shippingLabelUrl}
        trackingCode={trackingCode}
        shippingProvider={shippingProvider}
        shippingType={shippingType}
        metadata={metadata}
        itemName={fullItemName}
        itemImage={itemImage}
        itemPrice={itemPrice}
        currencySymbol={currencySymbol}
        recipientName={currentChatName}
      />

      {/* Shipping Instructions Modal */}
      <ShippingInstructionsModal
        visible={isInstructionsModalVisible}
        onClose={() => setIsInstructionsModalVisible(false)}
        shippingProvider={shippingProvider}
        shippingType={shippingType}
      />
    </View>
  );
};

/**
 * Memoize component to prevent unnecessary rerenders
 * Only rerender if message metadata, content, or isSeller prop changes
 * 
 * @section Performance - Memoization for optimization
 */
export default React.memo(ShippingLabelActivity);

/**
 * Styles following DigitizeApp design system
 * 
 * @section Styling - StyleSheet.create for performance
 * @section Code Quality - No inline styles
 */
const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: 16,
    marginVertical: 5,
    gap: 12,
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
  title: {
    fontSize: 16,
    color: "#07090C",
    fontFamily: "DMSansBold",
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: "#07090C",
    fontFamily: "DMSansRegular",
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 10,
    alignSelf: "stretch",
  },
  primaryButton: {
    backgroundColor: "#FF3B4A",
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 12,
    alignSelf: "stretch",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },
  secondaryButton: {
    borderColor: "#212C3D",
    borderWidth: 1,
    borderStyle: "solid",
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 12,
    alignSelf: "stretch",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "#212C3D",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },
  // Disabled styles
  primaryButtonDisabled: {
    backgroundColor: "#FFD8DB",
  },
  primaryButtonTextDisabled: {
    color: "#FF9DA4",
  },
  secondaryButtonDisabled: {
    borderColor: "#D3D5D8",
    backgroundColor: "transparent",
  },
  secondaryButtonTextDisabled: {
    color: "#D3D5D8",
  },
});

