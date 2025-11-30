import React from "react";
import { View, StyleSheet } from "react-native";
import { SkeletonBox } from "./purchase/SkeletonComponents";

const WithdrawalDetailsSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <SkeletonBox width="80%" height={12} marginBottom={8} />
          <SkeletonBox width="50%" height={10} />
        </View>
        <SkeletonBox width={70} height={28} borderRadius={8} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flex: {
    flex: 1,
  },
});

export default WithdrawalDetailsSkeleton;

