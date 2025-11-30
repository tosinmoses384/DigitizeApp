import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import StackHeader, { ResourcesHeader } from "../../components/StackHeader";
import { router } from "expo-router";
import { defaultStyles } from "../../constants/Styles";
import { fontSz } from "../../constants";
import { Colors } from "../../constants/Colors";
import ToggleTabs from "../../components/Toggle";
import BrandsList from "./brands";
import TriftersList from "./trifters";
import { useI18n } from "@hooks/use-i18n";

const Following = () => {
  const { t } = useI18n();
  const [selectedTab, setSelectedTab] = useState("first");

  const stores = [
    { name: "Next", items: "11M items" },
    { name: "Primark", items: "11M items" },
    { name: "Shein", items: "11M items" },
    { name: "Zara", items: "1M items" },
    { name: "H&M", items: "1M items" },
    { name: "New Look", items: "1M items" },
    { name: "Marks & Spencer", items: "1M items" },
    { name: "George", items: "1M items" },
    { name: "F&F", items: "1M items" },
    { name: "Pretty little things", items: "1M items" },
    { name: "River Island", items: "1M items" },
    { name: "Nike", items: "1M items" },
    { name: "Next", items: "11M items" },
    { name: "Primark", items: "11M items" },
    { name: "Shein", items: "11M items" },
    { name: "Zara", items: "1M items" },
    { name: "H&M", items: "1M items" },
    { name: "New Look", items: "1M items" },
    { name: "Marks & Spencer", items: "1M items" },
    { name: "George", items: "1M items" },
    { name: "F&F", items: "1M items" },
    { name: "Pretty little things", items: "1M items" },
    { name: "River Island", items: "1M items" },
    { name: "Nike", items: "1M items" },
  ];

  const [following, setFollowing] = useState(Array(stores.length).fill(false));

  const handleFollow = (index) => {
    const updatedFollowing = [...following];
    updatedFollowing[index] = !updatedFollowing[index];
    setFollowing(updatedFollowing);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors.light.background }]}
    >
      <StackHeader
        title={t('following.following')}
        isShowHeaderShadow
        onPress={() => router.back()}
      />
      {/* <ResourcesHeader title="Following" onPress={() => router.back()} /> */}
      <View style={{ marginHorizontal: 16 }}>
        <ToggleTabs
          currentTab={selectedTab}
          selectedTab={setSelectedTab}
          firstLabel={t('following.drbers')}
          secondLabel={t('following.brands')}
          small={false}
        />
      </View>
      {selectedTab === "first" ? (
        <TriftersList hideHeader followingStatus={1} />
      ) : (
        <BrandsList hideHeader followingStatus={1} />
      )}

      {/* <ScrollView showsVerticalScrollIndicator={false}>
        {stores.map((store, index) => (
          <View key={index} style={styles.sectionContainer}>
            <View style={styles.textContainer}>
              <Text style={{ fontFamily: "DMSansMedium" }}>{store.name}</Text>
              <Text style={{ fontFamily: "DMSansThin" }}>{store.items}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.buyButton,
                following[index] && styles.followingButton,
                { width: following[index] ? 100 : 80 },
              ]}
              onPress={() => handleFollow(index)}
            >
              <View style={styles.buyButtonContent}>
                <Text
                  style={[
                    styles.buyButtonText,
                    following[index] && styles.followingButtonText,
                  ]}
                >
                  {following[index] ? "Following" : "Follow"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView> */}
    </View>
  );
};

export default Following;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: 40,
    flex: 1,
  },
  // sectionContainer: {
  //   marginVertical: 20,
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  // },
  // textContainer: {
  //   flex: 1,
  // },
  // buyButton: {
  //   paddingVertical: 8,
  //   paddingHorizontal: 12,
  //   borderRadius: 16,
  //   justifyContent: "center",
  //   borderWidth: 1,
  //   alignItems: "center",
  //   borderColor: Colors.light.primaryBase,
  // },
  // followingButton: {
  //   backgroundColor: Colors.light.primaryBase,
  // },
  // buyButtonContent: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // buyButtonText: {
  //   marginLeft: 5,
  //   color: Colors.light.primaryBase,
  //   fontFamily: "DMSansBold",
  //   fontSize: fontSz(14),
  // },
  // followingButtonText: {
  //   color: "#fff",
  // },
});
