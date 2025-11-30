import CustomButton from "@components/CustomButton";
import { formatAmount } from "@helper/formatCash";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";
import { useI18n } from "@hooks/use-i18n";

const StartShippingActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const { t } = useI18n();
  const metadata = message?.metadata;
  const disabled = metadata?.is_active === "False";
  
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
              styles.startShippingButton,
              styles.startShippingButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.startShippingButtonText,
                styles.startShippingButtonTextDisabled,
              ]}
            >
              {t('orderTracking.startShipping')}
            </Text>
          </View>
        ) : (
          <CustomButton
            title={t('orderTracking.startShipping')}
            buttonStyle={styles.startShippingButton}
            textStyle={styles.startShippingButtonText}
            onPress={() => router.push(`/chats/Inbox-set-shipping?orderId=${metadata?.order_id}`)}
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
        <CustomButton
          title={t('orderTracking.cancelOrder')}
          buttonStyle={styles.cancelOrderButton}
          textStyle={styles.cancelOrderButtonText}
          onPress={() => {
            // TODO: Implement cancel order functionality
            console.log("Cancel order pressed");
          }}
        />
      )}
    </View>
  );
};

export default StartShippingActivity;

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
  startShippingButton: {
    backgroundColor: "#FF3B4A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 12,
    alignSelf: "stretch",
  },
  startShippingButtonText: {
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
  startShippingButtonDisabled: {
    backgroundColor: "#FFD8DB",
  },
  startShippingButtonTextDisabled: {
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
