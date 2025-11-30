import "react-native-get-random-values";
import React, { useState, useEffect, useRef, useCallback } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import StackHeader from "../../components/StackHeader";
import { Colors, SIZES } from "../../constants/Colors";
import { useAppDispatch, useAppSelector } from "@redux/store";
import { Ionicons } from "@expo/vector-icons";

import {
  setCurrentChatName,
  setMetaData,
} from "@redux/slice/profile/profileSlice";
import MakeOfferCard from "./make-offer-card";
import MessageTemplate from "./message-templates";
import MessageInput from "./MessageInput";
import CustomToastNotification from "@helper/toast-message";
import useChatMessages from "@hooks/chat-messages";
import { useNetworkStatus } from "@hooks/use-network-status";
import { useI18n } from "@hooks/use-i18n";
import TrackingStatusCard from "@components/TrackingStatusCard";
import OnlineTrackingModal from "@modals/OnlineTrackingModal";
import { useTrackingCardInfo } from "@hooks/use-tracking-card-info";
import { useChatMessageHandlers } from "@hooks/use-chat-message-handlers";

// Main ChatScreen Component
const ChatScreen = () => {
  const { t } = useI18n();
  const { profile, token, currentChatName, metaData, chatItem } =
    useAppSelector((state) => state?.userProfileSlice);
  const [toastDetails, setToastDetails]: any = useState(null);
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams();
  const flatListRef = useRef<FlatList<any>>(null);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const conversationId = typeof id === "string" ? id : "";
  const [didAutoScrollInitial, setDidAutoScrollInitial] = useState(false);


  const {
    messages,
    sendMessage,
    retryTextMessage,
    loadInitialChat,
    loadMoreMessages,
    refreshLatestMessages,
    loadingInitial,
    loadingMore,
    refreshing,
    hasLoadedInitially,
    hasNewWebSocketMessage,
    setHasNewWebSocketMessage,
    createOptimisticImageMessage,
    updateMessageProgress,
    updateMessageStatus,
    sendUploadedImageMessage,
    getMessageById,
  } = useChatMessages(conversationId, token, profile);

  const { isOffline } = useNetworkStatus();
  const [showOnlineTrackingModal, setShowOnlineTrackingModal] = useState(false);
  const [isPullingToRefresh, setIsPullingToRefresh] = useState(false);
  const pullThreshold = 80;

  const { trackingCardInfo, isOfflineShipping } = useTrackingCardInfo({
    messages,
    metaData,
  });

  const { handleSendTextMessage, handleSendImageMessage, handleRetryMessage } = useChatMessageHandlers({
    isOffline,
    sendMessage,
    createOptimisticImageMessage,
    updateMessageProgress,
    updateMessageStatus,
    sendUploadedImageMessage,
    getMessageById,
    retryTextMessage,
    token,
    setToastDetails,
  });


  useEffect(() => {
    if (conversationId) {
      loadInitialChat();
    }
  }, [conversationId, loadInitialChat]);

  const recordUserActivity = useCallback(() => {
  }, []);

  useEffect(() => {
    if (hasLoadedInitially && !didAutoScrollInitial && flatListRef.current) {
      flatListRef.current?.scrollToEnd({ animated: false });
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
          setDidAutoScrollInitial(true);
        }, 300);
      }, 100);
    }
  }, [hasLoadedInitially, didAutoScrollInitial]);

  useEffect(() => {
    if (hasNewWebSocketMessage && flatListRef.current) {
      flatListRef.current?.scrollToEnd({ animated: false });
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
          setHasNewWebSocketMessage(false);
        }, 300);
      }, 100);
    }
  }, [hasNewWebSocketMessage, setHasNewWebSocketMessage]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const offsetY = contentOffset.y;
    recordUserActivity();

    if (offsetY === 0 && !loadingMore) {
      loadMoreMessages();
    }

    const scrollBottom = contentSize.height - layoutMeasurement.height - offsetY;
    
    if (scrollBottom < -pullThreshold && !refreshing && !isPullingToRefresh) {
      setIsPullingToRefresh(true);
    } else if (scrollBottom >= -pullThreshold && isPullingToRefresh) {
      setIsPullingToRefresh(false);
    }
  };

  const handleExit = () => {
    router.back();
    dispatch(setCurrentChatName(""));
    dispatch(setMetaData(null));
  };

  const isSeller = metaData?.product_seller_id === profile?.id;



  const handleRefreshLatestMessages = useCallback(async () => {
    if (isOffline) {
      return;
    }
    
    recordUserActivity();
    await refreshLatestMessages();
  }, [isOffline, refreshLatestMessages, recordUserActivity]);

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const scrollBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;

      if (scrollBottom < -pullThreshold && isPullingToRefresh && !refreshing) {
        setIsPullingToRefresh(false);
        handleRefreshLatestMessages();
      }
    },
    [isPullingToRefresh, refreshing, pullThreshold, handleRefreshLatestMessages]
  );


  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        }}
      >
        {toastDetails && (
          <View style={{ position: "absolute", right: 0, top: 0, left: 0 }}>
            <CustomToastNotification
              message={toastDetails?.message}
              type={toastDetails?.type}
              autoHideDuration={toastDetails?.duration}
            />
          </View>
        )}
        <View style={{ paddingHorizontal: 16 }}>
          <StackHeader
            title={currentChatName || ""}
            onPress={
              showOfferDetails ? () => setShowOfferDetails(false) : handleExit
            }
          />
        </View>

        {metaData && (
          <MakeOfferCard
            metaData={metaData}
            isSeller={isSeller}
            isShowOfferDetails={showOfferDetails}
            handleMakeOffer={() => setShowOfferDetails(true)}
            onClose={() => setShowOfferDetails(false)}
            refetch={loadInitialChat}
            chatItem={chatItem}
          />
        )}

        {/* Tracking Status Card - Only for online/platform shipping */}
        {trackingCardInfo.shouldShow && (
          <TrackingStatusCard
            shippingStatusId={trackingCardInfo.shippingStatusId}
            isSeller={isSeller}
            courierName={trackingCardInfo.courierName}
            shippingProvider={trackingCardInfo.shippingProvider}
            shippingStatus={trackingCardInfo.shippingStatus}
            estimatedDeliveryTime={trackingCardInfo.estimatedDeliveryTime}
            trackingCode={trackingCardInfo.trackingCode}
            onTrackingPress={() => {
              // For online shipping, show modal. For offline shipping, navigate to screen
              if (trackingCardInfo.isOnlineShipping) {
                setShowOnlineTrackingModal(true);
              } else {
                router.push({
                  pathname: "/chats/track-parcel",
                  params: {
                    orderId: trackingCardInfo.orderId || "",
                    requestId: trackingCardInfo.requestId || "",
                    shippingStatus: trackingCardInfo.shippingStatus || "Shipped",
                    shippingStatusId: String(trackingCardInfo.shippingStatusId),
                    collectionDate: metaData?.collection_date || "",
                    estimatedDeliveryAmount: metaData?.estimated_delivery_amount || "",
                    title: isSeller ? "Track Shipment" : "Order Shipped",
                    sellerName: currentChatName || "Seller",
                    courierName: trackingCardInfo.courierName || "N/A",
                    estimatedDeliveryTime: trackingCardInfo.estimatedDeliveryTime || "N/A",
                  },
                });
              }
            }}
          />
        )}

        {/* Chat Messages */}
        <FlatList
          data={messages}
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item?.messageId}
          renderItem={({ item }) => (
            <MessageTemplate
              message={item}
              profileId={profile?.id}
              key={item?.messageId}
              onRetry={handleRetryMessage}
              isSeller={isSeller}
              isOfflineShipping={isOfflineShipping}
              onMakeNewOffer={() => setShowOfferDetails(true)}
            />
          )}
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          contentContainerStyle={styles.messageList}
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            if (hasNewWebSocketMessage) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          ListHeaderComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={Colors.light.primaryBase}
                style={{ marginVertical: 10 }}
              />
            ) : null
          }
          ListFooterComponent={
            messages.length > 0 ? (
              <TouchableOpacity
                style={styles.footerRefreshContainer}
                onPress={handleRefreshLatestMessages}
                disabled={refreshing || isOffline}
                activeOpacity={0.7}
              >
                {refreshing ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={Colors.light.primaryBase}
                    />
                    <Text style={styles.refreshingText}>{t('chat.checkingNewMessages')}</Text>
                  </>
                ) : isPullingToRefresh ? (
                  <>
                    <Ionicons
                      name="arrow-up-circle"
                      size={24}
                      color={Colors.light.primaryBase}
                    />
                    <Text style={styles.pullingText}>{t('chat.releaseToRefresh')}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="refresh"
                      size={20}
                      color={isOffline ? "#ccc" : Colors.light.primaryBase}
                    />
                    <Text style={[
                      styles.refreshHintText,
                      isOffline && styles.refreshHintDisabled
                    ]}>
                      {isOffline ? t('chat.offlineCannotRefresh') : t('chat.swipeToRefresh')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null
          }
        />

        {loadingInitial && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.light.primaryBase} />
          </View>
        )}

      </View>

      <MessageInput
        onSendText={handleSendTextMessage}
        onSendImage={handleSendImageMessage}
        isOffline={isOffline}
      />

      {/* Online Tracking Modal */}
      <OnlineTrackingModal
        visible={showOnlineTrackingModal}
        onClose={() => setShowOnlineTrackingModal(false)}
        orderId={trackingCardInfo.orderId || metaData?.order_id || ""}
        shippingStatusId={trackingCardInfo.shippingStatusId}
        sellerName={currentChatName || "Seller"}
        isSeller={isSeller}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messageList: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
    zIndex: 10,
  },
  footerRefreshContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  refreshHintText: {
    color: "#999",
    fontSize: 12,
    fontFamily: "DMSansRegular",
    textAlign: "center",
  },
  refreshHintDisabled: {
    color: "#ccc",
  },
  refreshingText: {
    color: Colors.light.primaryBase,
    fontSize: 12,
    fontFamily: "DMSansMedium",
    textAlign: "center",
  },
  pullingText: {
    color: Colors.light.primaryBase,
    fontSize: 13,
    fontFamily: "DMSansBold",
    textAlign: "center",
  },
});

export default ChatScreen;
