import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";

interface IOrderCancelledActivity extends ActivityComponentProps {}

const OrderCancelledActivity = ({
  message: item,
  profileId,
}: IOrderCancelledActivity) => {
  return (
    <View
      style={[
        styles.messageContainer,
        item?.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <View>
        <Text style={styles.title}>Order Cancelled</Text>
        <Text style={styles.subtitle}>
          This order was cancelled and the refund is not being processed to your
          wallet.
        </Text>
      </View>
    </View>
  );
};

export default OrderCancelledActivity;

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
  },
});
