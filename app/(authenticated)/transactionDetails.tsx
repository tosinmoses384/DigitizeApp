import {
  Platform,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Colors, SIZES } from "../../constants/Colors";
import { fontSz } from "../../constants";
import RightIcon from "../../assets/images/svg/chevron-right-arrow.svg";
import StackHeader from "../../components/StackHeader";
import { router, useLocalSearchParams } from "expo-router";
import { defaultStyles } from "../../constants/Styles";

type Transaction = {
  description: string;
  date: string;
  amount: string;
};

const TransactionDetails = () => {
  const { month } = useLocalSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (month === "June") {
      setTransactions([
        { description: "Start balance", date: "June 1, 2024", amount: "$0.00" },
        {
          description: "End balance",
          date: "June 30, 2024",
          amount: "$150.00",
        },
        {
          description: "Withdrawal to bank account",
          date: "June 12, 2024",
          amount: "$50.00",
        },
        { description: "Sold", date: "June 15, 2024", amount: "$100.00" },
      ]);
    } else if (month === "May") {
      setTransactions([
        { description: "Start balance", date: "May 1, 2024", amount: "$50.00" },
        { description: "End balance", date: "May 31, 2024", amount: "$100.00" },
        { description: "Purchase", date: "May 10, 2024", amount: "$50.00" },
      ]);
    } else if (month === "April") {
      setTransactions([
        {
          description: "Start balance",
          date: "April 1, 2024",
          amount: "$100.00",
        },
        {
          description: "End balance",
          date: "April 30, 2024",
          amount: "$200.00",
        },
        { description: "Sold", date: "April 15, 2024", amount: "$100.00" },
      ]);
    }
  }, [month]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        paddingHorizontal: 20,
      }}
    >
      <StackHeader title={`${month} 2024`} onPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{`${month} 2024`}</Text>
        {transactions.slice(0, 2).map((transaction, index) => (
          <View key={index}>
            <View style={styles.cardContainer}>
              <View style={styles.cardHeader}>
                <Text style={styles.startText}>{transaction.description}</Text>
              </View>
              {/* <View style={styles.cardBody}> */}
              <View style={styles.transactionRow}>
                <Text style={styles.rowDate}>{transaction.date}</Text>
                <Text style={styles.amountText}>{transaction.amount}</Text>
              </View>
              {/* </View> */}
            </View>
          </View>
        ))}

        {/* "Transactions" heading and remaining cards */}
        <Text style={styles.transactionsText}>Transactions</Text>
        {transactions.slice(2).map((transaction, index) => (
          <View key={index}>
            <TouchableOpacity activeOpacity={0.7}>
              <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <Text style={styles.startText}>
                    {transaction.description}
                  </Text>
                </View>
                <View style={styles.transactionRow}>
                  <Text style={styles.rowDate}>Jordan 1 sneaker</Text>
                  <View style={styles.dot}></View>

                  <Text style={styles.rowDate}>{transaction.date}</Text>
                  <Text style={styles.amountText2}>{transaction.amount}</Text>
                  <RightIcon />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TransactionDetails;

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderColor: "#E9EAEB",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowDate: {
    fontSize: fontSz(14),
    fontFamily: "DMSansRegular",
    color: "#7A869A",
    textAlign: "left",
  },
  monthText: {
    fontSize: fontSz(14),
    fontFamily: "DMSansRegular",
    color: "#000000",
  },
  startText: {
    fontSize: fontSz(14),
    fontFamily: "DMSansBold",
    color: "#000000",
  },
  amountText: {
    fontSize: fontSz(14),
    fontFamily: "DMSansRegular",
    color: "#90959E",
  },
  amountText2: {
    fontSize: fontSz(14),
    fontFamily: "DMSansBold",
    color: "#1E3448",
  },
  sectionTitle: {
    fontSize: fontSz(14),
    fontFamily: "DMSansMedium",
    marginBottom: 10,
    marginTop: 20,
  },
  transactionsText: {
    fontSize: fontSz(18),
    fontFamily: "DMSansBold",
    marginBottom: 10,
    marginTop: 20,
  },
  dot: {
    height: 5,
    width: 5,
    backgroundColor: "#898989",
    borderRadius: 5,
    marginHorizontal: 8,
  },
});
