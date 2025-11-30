import NewBottomModal from "@components/NewBottomModal";
import { Colors } from "@constants/Colors";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CloseIcon from "../assets/images/svg/x-close.svg";
interface ISelectMonthModal {
  isShow: boolean;
  onClose: () => void;
  onSelect: any;
}
const SelectMonthModal = ({ isShow, onClose, onSelect }: ISelectMonthModal) => {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <NewBottomModal isShow={isShow} onClose={onClose} maxHeight={293}>
      <View style={styles.body}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Select Month</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeIconView,
              pressed && styles.pressed,
            ]}
            onPress={onClose}
          >
            <CloseIcon />
          </Pressable>
        </View>
        <ScrollView style={styles.innerBody}>
          {monthNames?.map((list, index) => (
            <Pressable
              key={list}
              style={({ pressed }) => [
                styles.monthList,
                pressed && styles.pressed,
              ]}
              onPress={() => onSelect({ title: list, index })}
            >
              <Text style={styles.monthListText}>{list}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </NewBottomModal>
  );
};

export default SelectMonthModal;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingBottom: 20,
    backgroundColor: Colors.light.background,
  },
  headerContainer: {
    paddingVertical: 12,
    position: "relative",
    backgroundColor: "white",
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#071827",
    fontFamily: "DMSansMedium",
  },
  pressed: {
    opacity: 0.5,
  },
  closeIconView: {
    position: "absolute",
    right: 0,
    top: 16,
  },
  innerBody: {
    paddingVertical: 16,
  },
  monthList: {
    paddingVertical: 12,
    borderBottomColor: "#EDF2F7",
    borderBottomWidth: 1,
  },
  monthListText: {
    fontSize: 14,
    color: "#6B727E",
    textAlign: "center",
  },
});
