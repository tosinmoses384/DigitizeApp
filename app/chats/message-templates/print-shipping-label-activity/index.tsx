import CustomButton from "@components/CustomButton";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { ActivityComponentProps } from "../types";
import { useI18n } from "@hooks/use-i18n";
import { useAppSelector } from "@redux/store";
import orderServices from "@services/features/orders/orderService";
import { useToast } from "react-native-toast-notifications";

const PrintShippingLabelActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const { t } = useI18n();
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const [isCancelling, setIsCancelling] = useState(false);
  const toast = useToast();
  const metadata = message?.metadata;
  const disabled = metadata?.is_active === "False";

  // Memoize the navigation handler to prevent re-creation on every render
  const handleGetShippingLabel = useCallback(() => {
    router.push({
      pathname: '/chats/confirm-shipping-details',
      params: {
        orderId: metadata?.order_id,
        requestId: metadata?.request_id,
        labelType: 'digital' // Default to digital label type
      }
    });
  }, [metadata?.order_id, metadata?.request_id]);

  const handleCancelOrder = useCallback(() => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order? This action cannot be undone.",
      [
        {
          text: t("common.no") || "No",
          style: "cancel",
        },
        {
          text: t("common.yes") || "Yes",
          style: "destructive",
          onPress: async () => {
            if (!token || !metadata?.order_id) return;

            setIsCancelling(true);

            try {
              const response = await orderServices.cancelOrder(
                token,
                metadata.order_id
              );

              if (response.status === 200 || response.responseCode === "0") {
                toast.show(t("orderTracking.orderCancelled") || "Order cancelled successfully", {
                  type: "success"
                });
              } else {
                // Handle validation errors from response
                const errorMessage = 
                  response.detail || 
                  (response.errors as any)?.model?.[0] || 
                  response.message || 
                  t("common.error");
                
                toast.show(errorMessage, {
                  type: "danger"
                });
              }
            } catch (error: any) {
              // Handle axios/network errors
              const errorResponse = error?.response?.data;
              const errorMessage = 
                errorResponse?.detail || 
                errorResponse?.errors?.model?.[0] || 
                "An error occurred while cancelling the order";

              toast.show(errorMessage, {
                type: "danger"
              });
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  }, [token, metadata?.order_id, t, toast]);
  
  return (
    <View
      style={[
        styles.messageContainer,
        message?.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <View style={styles.buttonsWrapper}>
        {disabled ? (
          <View
            style={[
              styles.getShippingLabelButton,
              styles.getShippingLabelButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.getShippingLabelButtonText,
                styles.getShippingLabelButtonTextDisabled,
              ]}
            >
              {t('orderTracking.getShippingLabel')}
            </Text>
          </View>
        ) : (
          <CustomButton
            title={t('orderTracking.getShippingLabel')}
            buttonStyle={styles.getShippingLabelButton}
            textStyle={styles.getShippingLabelButtonText}
            onPress={handleGetShippingLabel}
          />
        )}
      </View>
      {disabled ? (
        <View
          style={[styles.cancelOrderButton, styles.cancelOrderButtonDisabled]}
        >
          <Text
            style={[
              styles.cancelOrderButtonText,
              styles.cancelOrderButtonTextDisabled,
            ]}
          >
            {t('orderTracking.cancelOrder')}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.cancelOrderButton,
            isCancelling && styles.cancelOrderButtonDisabled
          ]}
          onPress={handleCancelOrder}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <ActivityIndicator size="small" color="#212C3D" />
          ) : (
            <Text style={styles.cancelOrderButtonText}>
              {t('orderTracking.cancelOrder')}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(PrintShippingLabelActivity);

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
  buttonsWrapper: {
    alignSelf: "stretch",
  },
  getShippingLabelButton: {
    backgroundColor: "#FF3B4A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 12,
    alignSelf: "stretch",
  },
  getShippingLabelButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "left",
  },
  cancelOrderButton: {
    borderColor: "#212C3D",
    borderWidth: 1,
    borderStyle: "solid",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 12,
    alignSelf: "stretch",
    backgroundColor: "transparent",
  },
  cancelOrderButtonText: {
    color: "#212C3D",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "left",
  },
  // Disabled styles
  getShippingLabelButtonDisabled: {
    backgroundColor: "#FFD8DB",
  },
  getShippingLabelButtonTextDisabled: {
    color: "#FF9DA4",
  },
  cancelOrderButtonDisabled: {
    borderColor: "#D3D5D8",
    backgroundColor: "transparent",
  },
  cancelOrderButtonTextDisabled: {
    color: "#D3D5D8",
  },
});
