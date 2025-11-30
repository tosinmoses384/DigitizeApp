import { ChatMessage } from "models/ChatMessage";

/**
 * Constants for chat render activity types
 * These correspond to the chat_render metadata field
 */
export const ACTIVITY_TYPES = {
  DEFAULT: "DefaultActivity",
  SELLER_INTRO: "SellerIntroActivity",
  OFFER_SUMMARY: "OfferSummaryActivity",
  OFFER_CONFIRMATION: "OfferConfirmationActivity",
  OFFER_DECLINED: "OfferDeclinedActivity",
  OFFER_ACCEPTED: "OfferAcceptedActivity",
  OFFER_UPDATE: "OfferUpdateActivity",
  OFFER_PURCHASE: "OfferPurchaseActivity",
  SHIPPING_SUMMARY: "ShippingSummaryActivity",
  SHIPPING_CONFIRMATION: "ShippingConfirmationActivity",
  SHIPPING_TRACKING_UPDATE: "ShippingTrackingUpdateActivity",
  PAYMENT_SUMMARY: "PaymentSummaryActivity",
  PAYMENT_CONFIRMATION: "PaymentConfirmationActivity",
  PAYMENT_UPDATE: "PaymentUpdateActivity",
  ORDER_SUMMARY: "OrderSummaryActivity",
  ORDER_CONFIRMATION: "OrderConfirmationActivity",
  ORDER_COMPLETED: "OrderCompletedActivity",
  ORDER_CANCELLED: "OrderCancelledActivity",
  ORDER_UPDATE: "OrderUpdateActivity",
  TRANSACTION_SUMMARY: "TransactionSummaryActivity",
  TRANSACTION_CONFIRMATION: "TransactionConfirmationActivity",
  TRANSACTION_UPDATE: "TransactionUpdateActivity",
  RESERVE_ITEM: "ReserveItemActivity",
  START_OFFLINE_SHIPPING: "StartOfflineShippingActivity",
  PRINT_SHIPPING_LABEL: "PrintShippingLabelActivity",
  SHIPPING_LABEL: "ShippingLabelActivity",
  OFFLINE_START_SHIPPING: "OfflineStartShippingActivity",
  DELIVERY_CONFIRMATION: "DeliveryConfirmationActivity",
  SHIPPING_UPDATE: "ShippingUpdateActivity",
  AWAITING_DELIVERY_CONFIRMATION: "AwaitingDeliveryConfirmation",
  START_SHIPPING: "StartShippingActivity",
  UPDATE_TRACKING_INFO: "UpdateTrackingInfoActivity",
  REPORT_ISSUE: "ReportIssueActivity",
  LEAVE_REVIEW: "LeaveReviewActivity",
  ORDER_TRACKING_INFO: "OrderTrackingInfoActivity",
  SHIPPING_DROP_OFF_CONFIRMATION: "ShippingDropOffConfirmationActivity",
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES];

export interface MessageTemplateProps {
  message: ChatMessage;
  profileId: string;
  onRetry?: (messageId: string) => void;
  isSeller?: boolean;
  isOfflineShipping?: boolean;
  onMakeNewOffer?: () => void;
}

export interface ActivityComponentProps {
  profileId: string;
  message: ChatMessage;
  isSeller?: boolean;
}

export interface OfferConfirmationActivityProps extends ActivityComponentProps {
  messageType: string;
  handleAcceptOffer: (itemId: string) => void;
  acceptOfferLoader: boolean;
  declineOfferLoader: boolean;
  handleDeclineOffer: (itemId: string) => void;
  selectedActiveItemId: string;
}

export interface OfferDeclineActivityProps extends ActivityComponentProps {
  handleMakeNewOffer: () => void;
}

export interface OrderTrackingInfoActivityProps {
  item: ChatMessage;
  trackingCode?: string;
  seller?: string;
  courier?: string;
  deliveryTime?: string;
  disabled?: boolean;
}

export interface UpdateTrackingInfoActivityProps extends ActivityComponentProps {
  disabled: boolean;
}

export interface ReportIssueActivityProps extends ActivityComponentProps {
  disabled: boolean;
  showIcon: boolean;
}

export interface LeaveReviewActivityProps extends ActivityComponentProps {
  disabled: boolean;
  deadlineDate?: string;
  deadlineTime?: string;
}
