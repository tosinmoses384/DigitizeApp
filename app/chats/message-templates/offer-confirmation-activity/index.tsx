import CustomButton from "@components/CustomButton";
import { formatAmount } from "@helper/formatCash";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";
import { useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { router } from "expo-router";
import CustomToastNotification from "@helper/toast-message";

const OfferConfirmationActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const metadata = message?.metadata;
  const { profile, token } = useAppSelector((state) => state?.userProfileSlice);
  
  const [acceptOfferLoader, setAcceptOfferLoader] = useState(false);
  const [declineOfferLoader, setDeclineOfferLoader] = useState(false);
  const [toastDetails, setToastDetails] = useState<any>(null);

  const handleAcceptOffer = () => {
    setToastDetails(null);
    setAcceptOfferLoader(true);

    const messageType = metadata?.message_type || metadata?.type;
    const isBundle = messageType === "BundlePurchase";

    const serviceCall = isBundle
      ? marketplaceServices.acceptBundleOffer(
          token,
          metadata?.product_id,
          metadata?.offer_id
        )
      : marketplaceServices.acceptOffer(
          token,
          profile?.countryId,
          metadata?.product_id,
          metadata?.offer_id
        );

    serviceCall
      .then((res: any) => {
        setAcceptOfferLoader(false);
        if (res?.status === 200) {
          return;
        }

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
        
        setToastDetails({
          message: `${res?.detail || res?.Message}`,
          type: "error",
          duration: 4000,
        });
      })
      .catch((error) => {
        setAcceptOfferLoader(false);
        setToastDetails({
          message: "Failed to accept offer. Please try again.",
          type: "error",
          duration: 4000,
        });
      });
  };

  const handleDeclineOffer = () => {
    setToastDetails(null);
    setDeclineOfferLoader(true);

    const messageType = metadata?.message_type || metadata?.type;
    const isBundle = messageType === "BundlePurchase";

    const serviceCall = isBundle
      ? marketplaceServices.declineBundleOffer(
          token,
          metadata?.product_id,
          metadata?.offer_id
        )
      : marketplaceServices.declineOffer(
          token,
          profile?.countryId,
          metadata?.product_id,
          metadata?.offer_id
        );

    serviceCall
      .then((res: any) => {
        setDeclineOfferLoader(false);
        if (res?.status === 200) {
          return;
        }

        if (res?.responseCode === 401) {
          return router.push("/Onboarding");
        }
        
        setToastDetails({
          message: `${res?.detail || res?.Message}`,
          type: "error",
          duration: 4000,
        });
      })
      .catch((error) => {
        setDeclineOfferLoader(false);
        setToastDetails({
          message: "Failed to decline offer. Please try again.",
          type: "error",
          duration: 4000,
        });
      });
  };

  return (
    <>
      {toastDetails && (
        <CustomToastNotification
          message={toastDetails.message}
          type={toastDetails.type}
          autoHideDuration={3000}
        />
      )}
      <View
        style={[
          styles.messageContainer,
          message?.isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={styles.offerAmount}>
          <Text>{formatAmount(parseInt(message.metadata?.offer_amount || 0), message.metadata?.currency_symbol)} </Text>
          <Text style={styles.offerAmountWas}>
            {formatAmount(
              parseInt(message?.metadata?.product_amount || 0),
              message.metadata?.currency_symbol
            )}
          </Text>
        </Text>
        <View style={styles.btnView}>
          <CustomButton
            title="Decline"
            buttonStyle={[
              styles.btnDecline,
              metadata?.is_active === "False" && styles.btnDisabled
            ]}
            textStyle={[
              styles.btnDeclineText,
              metadata?.is_active === "False" && styles.btnTextDisabled
            ]}
            onPress={handleDeclineOffer}
            loader={declineOfferLoader}
            showLoadingText
            disabled={metadata?.is_active === "False"}
          />
          <CustomButton
            title="Accept"
            buttonStyle={[
              styles.btn,
              metadata?.is_active === "False" && styles.btnDisabled
            ]}
            textStyle={[
              styles.btnText,
              metadata?.is_active === "False" && styles.btnTextDisabled
            ]}
            onPress={handleAcceptOffer}
            loader={acceptOfferLoader}
            showLoadingText
            disabled={metadata?.is_active === "False"}
          />
        </View>
      </View>
    </>
  );
};

export default OfferConfirmationActivity;

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
  btn: {
    backgroundColor: "#FF3B4A",
    paddingVertical: 9,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: "#FF3B4A",
    borderRadius: 12,
  },
  btnText: {
    color: "white",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  btnView: {
    marginTop: 8,
    flexDirection: "row",
    gap: 4,
  },
  btnDecline: {
    backgroundColor: "white",
    paddingVertical: 9,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: "#212C3D",
    borderRadius: 12,
  },
  btnDeclineText: {
    color: "#212C3D",
    fontSize: 14,
    fontFamily: "DMSansMedium",
  },
  btnDisabled: {
    backgroundColor: "#E9EAEB",
    borderColor: "#E9EAEB",
  },
  btnTextDisabled: {
    color: "#90959E",
  },
});
