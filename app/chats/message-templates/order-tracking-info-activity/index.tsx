import React, { useState, useCallback } from "react";
import { Text, StyleSheet, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useAppSelector } from "@redux/store";
import { ActivityComponentProps } from "../types";
import { useI18n } from "@hooks/use-i18n";
import { useShippingType } from "@hooks/use-shipping-details";
import OnlineTrackingModal from "@modals/OnlineTrackingModal";

/**
 * OrderTrackingInfoActivity Component
 * 
 * Displays tracking information for shipped orders.
 * Shows OnlineTrackingModal for online/platform shipping,
 * or navigates to track-parcel page for offline shipping.
 * 
 * @section Architecture Requirements - Message template activity component
 * @section Performance - Uses React hooks and React Query for optimization
 * @section API Integration - Uses shipping details API to determine shipping type
 */

const OrderTrackingInfoActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const { t } = useI18n();
  const metadata = message?.metadata;
  const currentChatName = useAppSelector((state) => state?.userProfileSlice?.currentChatName);
  const productMetaData = useAppSelector((state) => state?.userProfileSlice?.metaData);
  
  // State for tracking modal visibility
  const [isTrackingModalVisible, setIsTrackingModalVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract data from ShippingConfirmationActivity metadata
  const orderId = metadata?.order_id || productMetaData?.order_id;
  const requestId = metadata?.request_id;
  const shippingStatus = metadata?.shipping_status || "Shipped";
  const shippingStatusId = metadata?.shipping_status_id || "2";
  const collectionDate = metadata?.collection_date;
  const estimatedDeliveryAmount = metadata?.estimated_delivery_amount;
  const title = metadata?.title || "Order Shipped";
  const disabled = metadata?.is_active === "False";
  
  // Get shipping type from API with fallback to message metadata
  const { shippingDetails, isOnlineShipping } = useShippingType(orderId, !!orderId);
  
  // Fallback: If no API data, check message metadata shipping_type
  const metadataShippingType = metadata?.shipping_type || productMetaData?.shipping_type;
  const finalIsOnlineShipping = shippingDetails 
    ? isOnlineShipping 
    : metadataShippingType === "Platform";
  
  // Extract courier and delivery time from product metadata (Redux state)
  const courierName = 
    productMetaData?.delivery_service || 
    productMetaData?.courier_name || 
    metadata?.courier_name || 
    metadata?.delivery_service || 
    "N/A";
    
  const estimatedDeliveryTime = 
    productMetaData?.delivery_time || 
    productMetaData?.estimated_delivery_time || 
    metadata?.estimated_delivery_time || 
    metadata?.delivery_time || 
    "N/A";
  
  /**
   * Handle tracking info button press
   * @section User Interaction - Shows modal for online shipping or navigates for offline
   * @section API Integration - Uses shipping details API to determine behavior
   */
  const handleTrackingInfoPress = useCallback(() => {
    if (disabled) return;
    
    if (finalIsOnlineShipping) {
      // Show modal for online/platform shipping
      setIsTrackingModalVisible(true);
    } else {
      // Navigate to track parcel page for offline shipping
      router.push({
        pathname: "/chats/track-parcel",
        params: {
          orderId: orderId || "",
          requestId: requestId || "",
          shippingStatus,
          shippingStatusId,
          collectionDate: collectionDate || "",
          estimatedDeliveryAmount: estimatedDeliveryAmount || "",
          title,
          sellerName: currentChatName || "Seller",
          courierName: courierName,
          estimatedDeliveryTime: estimatedDeliveryTime,
        },
      });
    }
  }, [
    disabled,
    finalIsOnlineShipping,
    orderId,
    requestId,
    shippingStatus,
    shippingStatusId,
    collectionDate,
    estimatedDeliveryAmount,
    title,
    currentChatName,
    courierName,
    estimatedDeliveryTime,
  ]);

  /**
   * Close tracking modal
   * @section User Interaction - Modal close handler
   */
  const handleCloseModal = useCallback(() => {
    setIsTrackingModalVisible(false);
  }, []);

  const getTruncatedDescription = useCallback(() => {
    const fullDescription = message?.message || "This package has been sent to the delivery company and is being processed for delivery. Check the tracking information to know the status of your package.";
    const maxLength = 80;
    if (fullDescription.length <= maxLength) {
      return fullDescription;
    }
    return fullDescription.substring(0, maxLength) + '...';
  }, [message?.message]);

  return (
    <>
      <View
        style={[
          styles.messageContainer,
          message?.isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.orderShipped}>{title}</Text>
          <Text style={styles.description}>
            {isExpanded ? (message?.message || "This package has been sent to the delivery company and is being processed for delivery. Check the tracking information to know the status of your package.") : getTruncatedDescription()}
          </Text>
          
          {(message?.message || "This package has been sent to the delivery company and is being processed for delivery. Check the tracking information to know the status of your package.").length > 80 && (
            <Pressable 
              style={({ pressed }) => [
                styles.viewMoreButton,
                pressed && styles.viewMoreButtonPressed,
              ]} 
              onPress={() => setIsExpanded(!isExpanded)}
              accessibilityLabel={isExpanded ? "View less" : "View more"}
              accessibilityRole="button"
            >
              <Text style={styles.viewMoreText}>
                {isExpanded ? "View less" : "View more"}
              </Text>
            </Pressable>
          )}
          
          <Pressable 
            style={[styles.trackingButton, disabled && styles.trackingButtonDisabled]} 
            onPress={handleTrackingInfoPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={t('orderTracking.trackingInformation')}
          >
            <Text style={[styles.trackingButtonText, disabled && styles.trackingButtonTextDisabled]}>
              {t('orderTracking.trackingInformation')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Online Tracking Modal */}
      {isOnlineShipping && (
        <OnlineTrackingModal
          visible={isTrackingModalVisible}
          onClose={handleCloseModal}
          orderId={orderId || ""}
          shippingStatusId={parseInt(shippingStatusId, 10)}
          sellerName={currentChatName || "Seller"}
          isSeller={message?.isMine || false}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  theirMessage: {
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9EAEB',
    padding: 16,
    maxWidth: '85%',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderShipped: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans-Bold',
    color: '#07090C',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#464F5D',
    lineHeight: 20,
    marginBottom: 16,
  },
  trackingButton: {
    borderWidth: 1,
    borderColor: '#212C3D',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackingButtonDisabled: {
    borderColor: '#E9EAEB',
    opacity: 0.6,
  },
  trackingButtonText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'DMSans-Medium',
    color: '#212C3D',
  },
  trackingButtonTextDisabled: {
    color: '#99A1AB',
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 8,
  },
  viewMoreButtonPressed: {
    opacity: 0.7,
  },
  viewMoreText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#FF3B4A',
    textDecorationLine: 'underline',
  },
});

export default OrderTrackingInfoActivity;
