import React, { useMemo, memo, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import MessageSummaryActivity from "./offer-summary-activity";
import SellerIntroActivity from "./seller-intro-activity";
import OfferAcceptedActivity from "./offer-accepted-activity";
import OfferConfirmationActivity from "./offer-confirmation-activity";
import OrderCompletedActivity from "./order-completed-activity";
import OrderConfirmedActivity from "./order-confirmed-activity";
import OrderCancelledActivity from "./order-cancelled-activity";
import PaymentConfirmationActivity from "./payment-confirmation-activity";
import ShipingUpdateActivity from "./shipping-update-activity";
import OfferPurchaseActivity from "./offer-purchase-activity";
import OfferDeclineActivity from "./offer-decline-activity";
import StartShippingActivity from "./start-shipping-activity";
import PrintShippingLabelActivity from "./print-shipping-label-activity";
import ShippingLabelActivity from "./shipping-label-activity";
import UpdateTrackingInfoActivity from "./update-tracking-info-activity";
import ReportIssueActivity from "./report-issue-activity";
import LeaveReviewActivity from "./leave-review-activity";
import OrderTrackingInfoActivity from "./order-tracking-info-activity";
import DeliveryConfirmationActivity from "./delivery-confirmation-activity";
import ShippingDropOffConfirmationActivity from "./shipping-drop-off-confirmation-activity";
import AnimatedImageMessage from "./AnimatedImageMessage";
import ImageViewModal from "../../../modals/ImageViewerModal";
import MessageStatusIndicator from "@components/MessageStatusIndicator";
import { MessageTemplateProps, ACTIVITY_TYPES } from "./types";
import { getMessageCardStatus, isMessageCardActive } from "./utils";

/**
 * Determines if the seller should see the UpdateTrackingInfoActivity component
 * with the ability to update tracking information.
 * 
 * For ONLINE/Platform shipping (isOfflineShipping = false):
 * - ShippingUpdateActivity and ShippingTrackingUpdateActivity should show 
 *   OrderTrackingInfoActivity (view-only) for sellers
 * 
 * For OFFLINE/Custom shipping (isOfflineShipping = true):
 * - Seller can manually update via UpdateTrackingInfoActivity
 * 
 * @param isSeller - Whether the current user is the seller
 * @param metadata - Message metadata containing shipping status and activity info
 * @param isOfflineShipping - Feature flag indicating if offline shipping is enabled
 * @returns boolean - True if UpdateTrackingInfoActivity should be shown
 */
const shouldShowUpdateTrackingForSeller = (
  isSeller: boolean,
  metadata: any,
  isOfflineShipping: boolean
): boolean => {
  // Only applies to sellers
  if (!isSeller) {
    return false;
  }

  const chatRender = metadata?.chat_render;
  
  // For online/platform shipping (when offline shipping is NOT enabled),
  // sellers should see tracking info (view-only) NOT update tracking info
  const isShippingActivity = 
    chatRender === "ShippingUpdateActivity" || 
    chatRender === "ShippingTrackingUpdateActivity";
  
  if (isShippingActivity && !isOfflineShipping) {
    if (__DEV__) {
      console.log(
        `shouldShowUpdateTrackingForSeller: Online shipping detected (isOfflineShipping=false), showing view-only tracking`
      );
    }
    return false; // Show OrderTrackingInfoActivity (view-only) instead
  }

  // Special case: For ShippingUpdateActivity with is_active="False", 
  // still show UpdateTrackingInfoActivity but in disabled state
  const isShippingUpdateActivity = chatRender === "ShippingUpdateActivity";
  const isActive = metadata?.is_active?.toLowerCase() === "true";
  
  if (isShippingUpdateActivity && !isActive) {
    if (__DEV__) {
      console.log(
        `shouldShowUpdateTrackingForSeller: Showing disabled UpdateTrackingInfoActivity for ShippingUpdateActivity with is_active=False`
      );
    }
    return true; // Show component but it will be disabled
  }

  // For all other cases, check if updates are enabled by backend
  if (!isActive) {
    return false;
  }

  // Get shipping status ID
  const shippingStatusId = Number(metadata?.shipping_status_id);
  
  // Non-updateable statuses based on API response:
  // 4: Delivered - Order complete, no more updates needed
  // 5: Canceled - Order cancelled, no updates allowed
  // 8: Awaiting Delivery Confirmation - Waiting for buyer, seller cannot update
  const nonUpdateableStatuses = [4, 5, 8];
  
  if (nonUpdateableStatuses.includes(shippingStatusId)) {
    if (__DEV__) {
      console.log(
        `shouldShowUpdateTrackingForSeller: Status ${shippingStatusId} is non-updateable`
      );
    }
    return false;
  }

  // Seller can update for offline shipping or other statuses:
  // 0: Not Shipped
  // 1: Preparing For Shipment
  // 2: Shipped (only for offline/custom shipping)
  // 3: In Transit (only for offline/custom shipping)
  // 6: Shipping Issue
  // 7: Returning To Sender
  return true;
};

const MessageTemplate = ({
  message,
  profileId,
  onRetry,
  isSeller = false,
  isOfflineShipping = false,
  onMakeNewOffer,
}: MessageTemplateProps) => {
  // Internal state for image viewing
  const [imageUrl, setImageUrl] = useState("");
  
  // Memoize metadata to avoid repeated property access
  const metadata = useMemo(() => message?.metadata || {}, [message?.metadata]);

  // Memoize render type
  const renderType = useMemo(
    () => metadata.chat_render,
    [metadata.chat_render]
  );

  // Default message component (extracted for reuse)
  const DefaultMessage = useMemo(
    () => {
      const isUploadingImage = message?.status === "uploading" && message?.localImageUri;
      const displayImageUrl = isUploadingImage 
        ? message.localImageUri 
        : metadata?.mediaUrl;

      return (
        <>
          <View
            style={[
              styles.messageContainer,
              message?.isMine ? styles.myMessage : styles.theirMessage,
            ]}
            key={message?.messageId}
          >
            {message?.messageType === "Media" && displayImageUrl ? (
              <>
                <AnimatedImageMessage
                  imageUrl={displayImageUrl}
                  content={message?.content}
                  onPress={() => !isUploadingImage && setImageUrl(displayImageUrl)}
                />
                {isUploadingImage && (
                  <View style={styles.uploadOverlay}>
                    <View style={styles.uploadIndicator}>
                      <Text style={styles.uploadText}>
                        {message.uploadProgress}%
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.messageText}>{message?.content}</Text>
            )}
            {message?.isMine && (
              <MessageStatusIndicator
                status={message?.status}
                uploadProgress={message?.uploadProgress}
                onRetry={onRetry ? () => onRetry(message.messageId) : undefined}
              />
            )}
          </View>
          {imageUrl && (
            <ImageViewModal isShow onClose={() => setImageUrl("")} uri={imageUrl} />
          )}
        </>
      );
    },
    [message, metadata, imageUrl]
  );

  // Render based on activity type
  const renderMessageTemplate = () => {
    switch (renderType) {
      // Default Activity (0) - Standard chat messages
      case ACTIVITY_TYPES.DEFAULT:
      case undefined:
      case null:
        return DefaultMessage;

      // Seller Intro Activity (1) - Introductory seller message
      case ACTIVITY_TYPES.SELLER_INTRO:
        return <SellerIntroActivity message={message} profileId={profileId} isSeller={isSeller} />;

      // Offer Summary Activity (2) - Summary card for product offer
      case ACTIVITY_TYPES.OFFER_SUMMARY:
        return (
          <MessageSummaryActivity message={message} profileId={profileId} isSeller={isSeller} />
        );

      // Offer Confirmation Activity (3) - Confirmation that offer was sent/received
      case ACTIVITY_TYPES.OFFER_CONFIRMATION:
        return (
          <OfferConfirmationActivity message={message} profileId={profileId} isSeller={isSeller} />
        );

      // Offer Declined Activity (4) - Notification that offer was declined
      case ACTIVITY_TYPES.OFFER_DECLINED:
        return (
          <OfferDeclineActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
            onMakeNewOffer={onMakeNewOffer}
          />
        );

      // Offer Accepted Activity (5) - Notification that offer was accepted
      case ACTIVITY_TYPES.OFFER_ACCEPTED:
        return (
          <OfferAcceptedActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Offer Update Activity (6) - Update related to existing offer
      case ACTIVITY_TYPES.OFFER_UPDATE:
        return (
          <MessageSummaryActivity message={message} profileId={profileId} isSeller={isSeller} />
        );

      // Offer Purchase Activity (7) - Interface to purchase/checkout accepted offer
      case ACTIVITY_TYPES.OFFER_PURCHASE:
        return (
          <OfferPurchaseActivity message={message} profileId={profileId} isSeller={isSeller} />
        );

      // Shipping Summary Activity (8) - Summary of shipping details
      case ACTIVITY_TYPES.SHIPPING_SUMMARY:
        return (
          <ShipingUpdateActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Shipping Confirmation Activity (9) - Confirmation of shipping details
      case ACTIVITY_TYPES.SHIPPING_CONFIRMATION:
        // For seller: Show UpdateTrackingInfoActivity if they can update tracking
        // For buyer: Show OrderTrackingInfoActivity to view tracking info
        return shouldShowUpdateTrackingForSeller(isSeller, metadata, isOfflineShipping) ? (
          <UpdateTrackingInfoActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        ) : (
          <OrderTrackingInfoActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Shipping Tracking Update Activity (10) - Update about shipping status
      // For online/platform shipping: Always show OrderTrackingInfoActivity (view-only) for both buyer and seller
      case ACTIVITY_TYPES.SHIPPING_TRACKING_UPDATE:
        return (
          <OrderTrackingInfoActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Payment Summary Activity (11) - Summary of payment details
      case ACTIVITY_TYPES.PAYMENT_SUMMARY:
        return (
          <MessageSummaryActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Payment Confirmation Activity (12) - Payment successfully processed
      case ACTIVITY_TYPES.PAYMENT_CONFIRMATION:
        return (
          <PaymentConfirmationActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Payment Update Activity (13) - Update about payment status
      case ACTIVITY_TYPES.PAYMENT_UPDATE:
        return (
          <MessageSummaryActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Order Summary Activity (14) - Comprehensive order summary
      case ACTIVITY_TYPES.ORDER_SUMMARY:
        return (
          <MessageSummaryActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Order Confirmation Activity (15) - Order successfully placed
      case ACTIVITY_TYPES.ORDER_CONFIRMATION:
        console.log("Rendering OrderConfirmationActivity:", message);
        return <OrderConfirmedActivity message={message} profileId={profileId} isSeller={isSeller} />;

      // Order Completed Activity (16) - Order has been completed
      case ACTIVITY_TYPES.ORDER_COMPLETED:
        return (
          <OrderCompletedActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Order Cancelled Activity (17) - Order has been cancelled
      case ACTIVITY_TYPES.ORDER_CANCELLED:
        return (
          <OrderCancelledActivity message={message} profileId={profileId} isSeller={isSeller} />
        );

      // Order Update Activity (18) - Update about order status
      case ACTIVITY_TYPES.ORDER_UPDATE:
        return (
          <MessageSummaryActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Transaction Summary Activity (19) - Summary of financial transaction
      case ACTIVITY_TYPES.TRANSACTION_SUMMARY:
        return (
          <MessageSummaryActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Transaction Confirmation Activity (20) - Confirmation for transaction
      case ACTIVITY_TYPES.TRANSACTION_CONFIRMATION:
        return (
          <MessageSummaryActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Transaction Update Activity (21) - Update related to transaction
      case ACTIVITY_TYPES.TRANSACTION_UPDATE:
        return (
          <MessageSummaryActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Reserve Item Activity (22) - Item has been reserved
      case ACTIVITY_TYPES.RESERVE_ITEM:
        return (
          <MessageSummaryActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Start Offline Shipping Activity (23) - Initiate offline shipping
      case ACTIVITY_TYPES.START_OFFLINE_SHIPPING:
        return (
          <StartShippingActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Print Shipping Label Activity (24) - Print shipping label
      case ACTIVITY_TYPES.PRINT_SHIPPING_LABEL:
        return (
          <PrintShippingLabelActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Shipping Label Activity (25) - Display shipping label with instructions
      case ACTIVITY_TYPES.SHIPPING_LABEL:
        return (
          <ShippingLabelActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Offline Start Shipping Activity (26) - Offline shipping initiated
      case ACTIVITY_TYPES.OFFLINE_START_SHIPPING:
        return (
          <StartShippingActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Delivery Confirmation Activity (27) - Shipment delivered successfully
      case ACTIVITY_TYPES.DELIVERY_CONFIRMATION:
        return (
          <DeliveryConfirmationActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Shipping Drop-Off Confirmation Activity - Seller confirms package drop-off
      case ACTIVITY_TYPES.SHIPPING_DROP_OFF_CONFIRMATION:
        return (
          <ShippingDropOffConfirmationActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Shipping Update Activity (28) - Shipping status update
      case ACTIVITY_TYPES.SHIPPING_UPDATE:
        // For online/platform shipping (isOfflineShipping = false): 
        // Show OrderTrackingInfoActivity (view-only) for both buyer and seller
        // For offline/custom shipping (isOfflineShipping = true): 
        // Seller can update via UpdateTrackingInfoActivity, buyer views via ShipingUpdateActivity
        
        if (!isOfflineShipping) {
          // Online shipping: Both buyer and seller see tracking info (view-only)
          return (
            <OrderTrackingInfoActivity
              message={message}
              profileId={profileId}
              isSeller={isSeller}
            />
          );
        }
        
        // Offline shipping: Seller can update, buyer views
        return shouldShowUpdateTrackingForSeller(isSeller, metadata, isOfflineShipping) ? (
          <UpdateTrackingInfoActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        ) : (
          <ShipingUpdateActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Awaiting Delivery Confirmation (29) - Await buyer confirmation
      case ACTIVITY_TYPES.AWAITING_DELIVERY_CONFIRMATION:
        return (
          <OrderCompletedActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      // Legacy cases (maintain backward compatibility)
      case ACTIVITY_TYPES.START_SHIPPING:
        return (
          <StartShippingActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      case ACTIVITY_TYPES.UPDATE_TRACKING_INFO:
        return (
          <UpdateTrackingInfoActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      case ACTIVITY_TYPES.REPORT_ISSUE:
        return (
          <ReportIssueActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      case ACTIVITY_TYPES.LEAVE_REVIEW:
        return (
          <LeaveReviewActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      case ACTIVITY_TYPES.ORDER_TRACKING_INFO:
        return (
          <OrderTrackingInfoActivity
            message={message}
            profileId={profileId}
            isSeller={isSeller}
          />
        );

      default:
        return DefaultMessage;
    }
  };
  return renderMessageTemplate();
};

// Memoize component to prevent unnecessary rerenders
export default memo(MessageTemplate, (prevProps, nextProps) => {
  return (
    prevProps.message.messageId === nextProps.message.messageId &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.metadata === nextProps.message.metadata &&
    prevProps.message.status === nextProps.message.status &&
    prevProps.message.uploadProgress === nextProps.message.uploadProgress &&
    prevProps.profileId === nextProps.profileId
  );
});

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    position: "relative",
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
  messageText: {
    color: "#131111",
    fontFamily: "DMSansRegular",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  uploadIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadText: {
    color: "#131111",
    fontFamily: "DMSansBold",
    fontSize: 14,
  },
});
