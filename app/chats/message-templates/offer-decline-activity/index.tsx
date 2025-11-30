import CustomButton from "@components/CustomButton";
import { formatAmount } from "@helper/formatCash";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";

const OfferDeclineActivity = ({
  message,
  profileId,
  onMakeNewOffer,
}: ActivityComponentProps & { onMakeNewOffer?: () => void }) => {
  const metadata = message?.metadata;
  
  const handleMakeNewOffer = () => {
    if (onMakeNewOffer) {
      onMakeNewOffer();
    }
  };

  return (
    <View
      style={[
        styles.messageContainer,
        message?.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.offerAmount}>
        <Text>{formatAmount(parseInt(metadata?.offer_amount || 0), metadata?.currency_symbol)} </Text>
        <Text style={styles.offerAmountWas}>
          {formatAmount(
            parseInt(metadata?.product_amount || 0),
            metadata?.currency_symbol
          )}
        </Text>
      </Text>
      <Text style={styles.status}>Declined</Text>
      <View>
        <CustomButton
          title="Make new Offer"
          buttonStyle={[
            styles.btn,
            metadata?.is_active === "False" && styles.btnDisabled
          ]}
          textStyle={[
            styles.btnText,
            metadata?.is_active === "False" && styles.btnTextDisabled
          ]}
          onPress={handleMakeNewOffer}
          disabled={metadata?.is_active === "False"}
        />
      </View>
    </View>
  );
};

export default OfferDeclineActivity;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "55%",
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
  btn: {
    backgroundColor: "#FF3B4A",
    paddingVertical: 9,
    paddingHorizontal: 17,
    marginTop: 8,
    borderRadius: 12,
  },
  btnText: {
    color: "white",
    fontSize: 14,
    fontFamily: "DMSansMedium",
    textAlign: "center",
    width: "100%",
  },
  btnDisabled: {
    backgroundColor: "#E9EAEB",
    borderColor: "#E9EAEB",
  },
  btnTextDisabled: {
    color: "#90959E",
  },
});
