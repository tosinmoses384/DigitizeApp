import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";
import { formatAmount } from "@helper/formatCash";

const PaymentConfirmationActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const metadata = message?.metadata;
  
  return (
    <View
      style={[
        styles.messageContainer,
        message?.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <View>
        <Text style={styles.title}>Payment Confirmed</Text>
        <Text style={styles.subtitle}>{message?.content ?? ""}</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {formatAmount(parseInt(metadata?.order_amount || 0), metadata?.order_currency_symbol)}
          </Text>
          <Text style={styles.status}>Confirmed</Text>
        </View>
      </View>
    </View>
  );
};

export default PaymentConfirmationActivity;

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
    backgroundColor: "#F0F9F4",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#E9EAEB",
    borderWidth: 2,
  },
  title: {
    fontSize: 14,
    color: "#07090C",
    fontFamily: "DMSansBold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#07090C",
    fontFamily: "DMSansRegular",
    lineHeight: 20,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amount: {
    fontSize: 16,
    color: "#07090C",
    fontFamily: "DMSansBold",
  },
  status: {
    fontSize: 12,
    color: "#10B981",
    fontFamily: "DMSansMedium",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
