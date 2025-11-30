import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors } from "@constants/Colors";
import { router } from "expo-router";

import React from "react";
import { Platform, StatusBar, StyleSheet, Text, View } from "react-native";
interface IBuyerProtection {
  onClose: any;
}
const BuyerProtection = ({ onClose }: IBuyerProtection) => {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: Colors.light.background,
          // paddingHorizontal: 20,
          paddingVertical: 16,
          marginTop: Platform.OS == "android" ? 20 : 20,
        },
      ]}
    >
      <StatusBar backgroundColor={"white"} barStyle={"dark-content"} />
      <StackHeader isShowHeaderShadow title="" onPress={onClose} />
      <View style={styles.body}>
        <Text style={styles.title}>Buyer Protection</Text>
        <View style={styles.bodyTop}>
          <Text style={{ fontSize: 12, color: "#1E2226" }}>
            Generally, buyers cover the cost of shipping. The shipping cost is
            shown at checkout and its automatically added to the total payment
            for order
          </Text>
        </View>
        <View style={styles.bodyBottom}>
          <CustomButton
            title="Got it"
            buttonStyle={styles.gotItBtn}
            textStyle={styles.gotItBtnText}
            onPress={onClose}
          />
        </View>
      </View>
    </View>
  );
};
export default BuyerProtection;
const styles = StyleSheet.create({
  body: {
    flex: 1,
    padding: 16,
  },
  bodyTop: {
    flex: 1,
  },
  bodyBottom: {
    paddingVertical: 16,
  },
  gotItBtn: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
  },
  gotItBtnText: {
    width: "100%",
    textAlign: "center",
    fontSize: 14,
    color: "white",
    fontFamily: "DMSansMedium",
  },
  title: {
    fontSize: 20,
    color: "#071827",
    fontFamily: "DMSansSemiBold",
    marginBottom: 12,
  },
});
