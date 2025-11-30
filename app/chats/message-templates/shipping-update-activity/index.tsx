import CustomButton from "@components/CustomButton";
import { formatAmount } from "@helper/formatCash";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";

const ShipingUpdateActivity = ({
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
        <Text style={styles.title}>Delivered</Text>
        <Text style={styles.subtitle}>
          Package was delivered{" "}
          <Text style={styles.trackingCode}> Tracking Information</Text>
        </Text>
      </View>
    </View>
  );
};

export default ShipingUpdateActivity;

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

  title: {
    fontSize: 14,
    color: "#07090C",
    fontFamily: "DMSansSemiBold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: " #6B727E",
    marginBottom: 10,
  },
  amount: {
    color: "#6B727E",
    fontFamily: "DMSansMedium",
  },
  balanceText: {
    color: "#FF5C68",
    fontFamily: "DMSansMedium",
    textDecorationLine: "underline",
  },
  trackingCode: {
    marginLeft: 10,
    color: "#FF5C68",
    textDecorationLine: "underline",
  },
});
