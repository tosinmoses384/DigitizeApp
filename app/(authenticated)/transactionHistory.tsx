import {
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { Colors, SIZES } from "../../constants/Colors";
import { fontSz } from "../../constants";
import RightIcon from "../../assets/images/svg/chevron-right-arrow.svg";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { useI18n } from "@hooks/use-i18n";

const TransactionHistory = () => {
  const { t } = useI18n();
  const transactions = [
    { month: "June", amount: "$0.00" },
    { month: "May", amount: "$50.00" },
    { month: "April", amount: "$100.00" },
  ];

  const handleCardPress = (month: string) => {
    router.push(`/transactionDetails?month=${month}`);
  };

  return (
    <View
      style={[
        {
          flex: 1,
          paddingHorizontal: 20,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        },
      ]}
    >
      <StackHeader title={t('transactionHistory.transactionHistory')} onPress={() => router.back()} />

      <ScrollView>
        <Text style={styles.yearText}>{t('transactionHistory.year')}</Text>
        {transactions.map((transaction, index) => (
          <TouchableOpacity
            activeOpacity={0.7}
            key={index}
            style={styles.cardContainer}
            onPress={() => handleCardPress(transaction.month)}
          >
            <Text style={styles.monthText}>{transaction.month}</Text>
            <View style={styles.rightSection}>
              <Text style={styles.amountText}>{transaction.amount}</Text>
              <RightIcon />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default TransactionHistory;

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderColor: "#dcd8d833",
    borderWidth: 1,
  },
  yearText: {
    fontSize: fontSz(18),
    fontFamily: "DMSansBold",
    color: "#1E3448",
    marginBottom: 10,
  },
  monthText: {
    fontSize: fontSz(16),
    fontFamily: "DMSansMedium",
    color: "#1E3448",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  amountText: {
    fontSize: fontSz(14),
    fontFamily: "DMSansRegular",
    color: "#90959E",
    marginRight: 10,
  },
});
