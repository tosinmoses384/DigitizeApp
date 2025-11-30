import React from "react";
import { StyleSheet, Text, View } from "react-native";
interface ICheckBox {
  checked?: boolean;
  label?: any;
}
const PasswordCheckLabel = ({ checked, label }: ICheckBox) => {
  return (
    <View className={`${styles?.wrapper}`}>
      <Text
        style={[styles.label, checked ? styles?.checked : styles?.notChecked]}
      >
        *{label}
      </Text>
    </View>
  );
};
export default PasswordCheckLabel;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 2,
  },
  checked: {
    color: "#4C9D64",
  },
  notChecked: {
    color: "#C20114",
  },
  label: {
    fontFamily: "DMSansSemiBold",
    fontSize: 12,
    lineHeight: 16,
  },
});
