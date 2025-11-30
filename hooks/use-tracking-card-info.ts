import { useMemo } from "react";
import { useShippingType } from "@hooks/use-shipping-details";
import { ChatMessage } from "models/ChatMessage";

interface MetaData {
  order_id?: string;
  shipping_status_id?: string;
  shipping_type?: string;
  request_id?: string;
  tracking_code?: string;
  tracking_number?: string;
  courier_name?: string;
  delivery_service?: string;
  shipping_provider?: string;
  estimated_delivery_time?: string;
  delivery_time?: string;
  shipping_status?: string;
}

interface TrackingCardInfo {
  shouldShow: boolean;
  shippingType?: string;
  isOnlineShipping: boolean;
  shippingStatusId: number;
  orderId?: string;
  requestId?: string;
  trackingCode?: string;
  courierName?: string;
  estimatedDeliveryTime?: string;
  shippingProvider?: string;
  shippingStatus?: string;
}

interface UseTrackingCardInfoParams {
  messages: ChatMessage[];
  metaData: MetaData | null;
}

interface UseTrackingCardInfoReturn {
  orderId: string | null;
  trackingCardInfo: TrackingCardInfo;
  isOfflineShipping: boolean;
}

export const useTrackingCardInfo = ({
  messages,
  metaData,
}: UseTrackingCardInfoParams): UseTrackingCardInfoReturn => {
  const orderId = useMemo(() => {
    if (metaData?.order_id) {
      return metaData.order_id;
    }
    
    const orderConfirmationMessage = messages.find(
      m => m.metadata?.chat_render === "OrderConfirmationActivity" && m.metadata?.order_id
    );
    
    const paymentConfirmationMessage = messages.find(
      m => m.metadata?.chat_render === "PaymentConfirmationActivity" && m.metadata?.order_id
    );
    
    return orderConfirmationMessage?.metadata?.order_id || 
           paymentConfirmationMessage?.metadata?.order_id || 
           null;
  }, [metaData?.order_id, messages]);

  const {
    shippingDetails,
    isOfflineShipping,
  } = useShippingType(orderId, !!orderId);

  const trackingCardInfo = useMemo(() => {
    const hasPaymentConfirmed = messages.some(
      m => m.metadata?.chat_render === "PaymentConfirmationActivity" ||
           m.metadata?.chat_render === "OrderConfirmationActivity"
    );

    const eligibleShippingUpdates = messages
      .filter(m => (
        m.metadata?.chat_render === "ShippingUpdateActivity" ||
        m.metadata?.chat_render === "ShippingTrackingUpdateActivity"
      ))
      .filter(m => Number(m.metadata?.shipping_status_id) >= 2)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const latestShippingActivity = eligibleShippingUpdates[eligibleShippingUpdates.length - 1];

    const dropOffMessage = messages.find(
      m => m.metadata?.chat_render === "ShippingDropOffConfirmationActivity" &&
           m.metadata?.is_active === "False"
    );

    const hasShippingActivity = !!latestShippingActivity || !!dropOffMessage;

    const apiShippingType = shippingDetails?.shippingType;
    const messageShippingType = latestShippingActivity?.metadata?.shipping_type ||
                                dropOffMessage?.metadata?.shipping_type ||
                                metaData?.shipping_type;

    const finalShippingType = apiShippingType || messageShippingType;

    const isOnlineShippingForCard = finalShippingType === "Platform";

    const hasDeliveryMessage = messages.some(
      m => m.metadata?.chat_render === "DeliveryConfirmationActivity"
    );

    const hasAwaitingDeliveryConfirmation = messages.some(
      m => m.metadata?.chat_render === "AwaitingDeliveryConfirmation"
    );

    const hasPostDeliveryActivity = messages.some(
      m => m.metadata?.chat_render === "LeaveReviewActivity" ||
           m.metadata?.chat_render === "ReportIssueActivity"
    );

    const isOrderCancelled = messages.some(
      m => m.metadata?.chat_render === "OrderCancelledActivity"
    );

    const isOrderCompleted = messages.some(
      m => m.metadata?.chat_render === "OrderCompletedActivity" &&
           m.metadata?.is_active === "False"
    );

    const shippingStatusId = Number(
      latestShippingActivity?.metadata?.shipping_status_id ||
      metaData?.shipping_status_id
    );
    const isShippedOrInTransit = shippingStatusId >= 2 && shippingStatusId < 8;

    const hasBackendTrackingCard = messages.some(
      m => m.metadata?.chat_render === "OrderTrackingInfoActivity" &&
           Number(m.metadata?.shipping_status_id) >= 2 &&
           m.metadata?.is_active === "True"
    );

    const trackingInfo = latestShippingActivity?.metadata || metaData;

    const resolvedOrderId = orderId || trackingInfo?.order_id || metaData?.order_id;

    const trackingCode = shippingDetails?.shippingLabel?.trackingCodes?.[0] ||
                         trackingInfo?.tracking_code ||
                         trackingInfo?.tracking_number ||
                         metaData?.tracking_code ||
                         metaData?.tracking_number;

    const courierName = shippingDetails?.shippingProvider ||
                        shippingDetails?.shippingLabel?.courier ||
                        trackingInfo?.courier_name ||
                        trackingInfo?.delivery_service ||
                        trackingInfo?.shipping_provider ||
                        metaData?.courier_name ||
                        metaData?.delivery_service ||
                        metaData?.shipping_provider;

    const shippingProvider = shippingDetails?.shippingProvider ||
                             trackingInfo?.shipping_provider ||
                             metaData?.shipping_provider;

    const hasTrackingSignal = !!(trackingCode || courierName || shippingProvider);

    const shouldShow =
      hasPaymentConfirmed &&
      hasShippingActivity &&
      isOnlineShippingForCard &&
      !hasDeliveryMessage &&
      !hasAwaitingDeliveryConfirmation &&
      !hasPostDeliveryActivity &&
      !isOrderCancelled &&
      !isOrderCompleted &&
      !hasBackendTrackingCard &&
      isShippedOrInTransit &&
      !!resolvedOrderId &&
      hasTrackingSignal;

    const estimatedDeliveryTime = shippingDetails?.estimatedDeliveryDate ||
                                  trackingInfo?.estimated_delivery_time ||
                                  trackingInfo?.delivery_time ||
                                  metaData?.estimated_delivery_time ||
                                  metaData?.delivery_time;

    const shippingStatus = trackingInfo?.shipping_status || metaData?.shipping_status;

    return {
      shouldShow,
      shippingType: finalShippingType,
      isOnlineShipping: isOnlineShippingForCard,
      shippingStatusId,
      orderId: resolvedOrderId,
      requestId: trackingInfo?.request_id || metaData?.request_id,
      trackingCode,
      courierName,
      estimatedDeliveryTime,
      shippingProvider,
      shippingStatus,
    };
  }, [messages, metaData, shippingDetails, orderId]);

  return {
    orderId,
    trackingCardInfo,
    isOfflineShipping,
  };
};

