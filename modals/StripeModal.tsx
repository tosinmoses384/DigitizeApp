import NewBottomModal from "@components/NewBottomModal";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import CloseIcon from "../assets/images/svg/x-close.svg";
import { StripeProvider } from "@stripe/stripe-react-native";

interface IStripeModal {
  isShow: boolean;
  onClose: any;
}
const StripeModal = ({ isShow, onClose }: IStripeModal) => {
  const [publishableKey, setPublishableKey] = useState("");

  const fetchPublishableKey = async () => {
    //   const key = await fetchKey(); // fetch key from your server here
    //   setPublishableKey(key);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);
  return (
    <NewBottomModal isShow={isShow} onClose={onClose}>
      <View style={styles.body}>
        <View style={styles.header}>
          {/* <Text style={styles.headerText}>In this Photo</Text> */}
          <Pressable
            style={({ pressed }) => [
              styles.headerCloseIcon,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <CloseIcon />
          </Pressable>
        </View>
        <ScrollView
          style={styles.innerBody}
          showsVerticalScrollIndicator={false}
        >
          <StripeProvider
            publishableKey={publishableKey}
            merchantIdentifier="merchant.identifier" // required for Apple Pay
            urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
          >
            <Text>working</Text>
          </StripeProvider>
        </ScrollView>
      </View>
    </NewBottomModal>
  );
};

export default StripeModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: "#f9fefc",
  },
  header: {
    padding: 12,
    backgroundColor: "white",
    position: "relative",
  },
  headerCloseIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  pressed: {
    opacity: 0.5,
  },
  headerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#071827",
    fontFamily: "DMSansMedium",
  },
  innerBody: {
    paddingVertical: 16,
  },
  topCardBody: {
    flexDirection: "row",
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "white",
    marginBottom: 16,
  },
});
