import { formatAmount } from "@helper/formatCash";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";

const MessageSummaryActivity = ({
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
      <Text style={styles.offerAmount}>
        <Text>{formatAmount(parseInt(metadata?.offer_amount || metadata?.order_amount || metadata?.product_amount || 0), metadata?.currency_symbol)} </Text>
        <Text style={styles.offerAmountWas}>
          {formatAmount(
            parseInt(metadata?.product_amount || 0),
            metadata?.currency_symbol
          )}
        </Text>
      </Text>
      <Text style={styles.status}>Pending</Text>
    </View>
  );
};

export default MessageSummaryActivity;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
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
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
  },
  timestamp: {
    fontSize: 10,
    color: "#2c2828",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  offerAmount: {
    fontSize: 14,
    color: "#07090C",
    fontFamily: "DMSansMedium",
  },
  offerAmountWas: {
    color: "#90959E",
    fontSize: 14,
    fontFamily: "DMSansMedium",
    textDecorationLine: "line-through",
  },
  status: {
    marginTop: 4,
    color: "#07090C",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
});
