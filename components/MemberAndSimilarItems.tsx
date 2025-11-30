import { useAppSelector } from "@redux/store";
import marketplaceServices from "@services/features/marketplace/marketplaceServices";
import { IListItemsRequest } from "@services/features/wardrobe-service/models";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import CustomButton from "./CustomButton";
import MyResponsiveGrid from "./MyResponsiveGrid";
import RecommendedCard from "./RecommendedCard";
interface IMemberAndSimilarItems {
  details: any;
}
const MemberAndSimilarItems = ({ details }: IMemberAndSimilarItems) => {
  const [pageToken, setPageToken] = useState("");
  const [pageLoader, setPageLoader] = useState(true);
  const { countryId } = useAppSelector((state) => state.userCountryId);
  const { profile, token } = useAppSelector((state) => state.userProfileSlice);

  return (
    <View style={styles.wrapper}>
      {/* <ScrollView
        onScroll={isActiveTab != 1 ? getMemberItems : () => {}}
        scrollEventThrottle={16}
      > */}

      {/* </ScrollView> */}
    </View>
  );
};

export default MemberAndSimilarItems;

const styles = StyleSheet.create({
  wrapper: {
    padding: 16,
  },
  tabContainer: {
    padding: 5,
    backgroundColor: "rgba(237, 242, 247, 0.6)",
    flexDirection: "row",
  },
  tabActionView: {
    flex: 1,
    marginLeft: 5,
    marginRight: 5,
  },
  tabBtnBody: {
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 12,
    padding: 10,
  },
  tabBtnText: {
    fontSize: 12,
    color: "rgba(33, 44, 61, 1)",
    textAlign: "center",
    width: "100%",
    fontFamily: "DMSansSemiBold",
  },
  tabBtnTextInactive: {
    fontSize: 12,
    color: "rgba(33, 44, 61, 1)",
    textAlign: "center",
    width: "100%",
    fontFamily: "DMSansSemiBold",
  },
  tabBtnBodyInactive: {
    fontSize: 12,
    color: "transparent",
    textAlign: "center",
    width: "100%",
    fontFamily: "DMSansSemiBold",
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    position: "relative",
  },
});
