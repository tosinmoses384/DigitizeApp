import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { fontSz } from "../../constants";
import ChevronRightArrow from "../../assets/images/svg/chevron-right-arrow.svg";
import { Colors, SIZES } from "../../constants/Colors";

const DigitizeAppWorks = () => {
  const handleNavigation = (screen: any) => {
    router.push(screen);
  };
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        paddingHorizontal: 20,
      }}
    >
      <View
        style={{
          marginHorizontal: 20,
        }}
      >
        <StackHeader title="How DigitizeApp Works" onPress={() => router.back()} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <>
          <View style={styles.section}>
            {[
              { text: "Who pays for shipping?", screen: "/shipping" },
              { text: "What can you sell on DigitizeApp?", screen: "/shipping" },
              { text: "Selling your Items faster", screen: "/shipping" },
              { text: "Uploading an item step by step", screen: "/shipping" },
              { text: "What is an item Bump?", screen: "/shipping" },
              { text: "DigitizeApp Balance: How it works", screen: "/shipping" },
              { text: "Paying Through Vinted", screen: "/shipping" },
              { text: "Shipping an item", screen: "/shipping" },
              { text: "How to set a correct price?", screen: "/shipping" },
              { text: "Choosing the right parcel size", screen: "/shipping" },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.row, index === 6 && styles.lastRow]}
                onPress={() => handleNavigation(item.screen)}
              >
                <Text style={styles.rowText}>{item.text}</Text>
                <ChevronRightArrow width={20} height={20} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      </ScrollView>
    </View>
  );
};

export default DigitizeAppWorks;

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  section: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  rowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: fontSz(14),
    color: "#393939",
    fontFamily: "DMSansMedium",
  },

  lastRow: {
    borderBottomWidth: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
});
