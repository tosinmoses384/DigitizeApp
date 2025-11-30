import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
interface ICheckboxInput {
  checked?: boolean;
  onPress?: () => void;
}
const CheckboxInput = ({ checked, onPress }: ICheckboxInput) => {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.checkboxWrapper,
          { borderColor: checked ? "#FF3B4A" : "rgba(70, 79, 93, 1)" },
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={12}
            style={{ fontFamily: "DMSansBold" }}
            color="#FF3B4A"
          />
        )}
      </View>
    </Pressable>
  );
};

export default CheckboxInput;

const styles = StyleSheet.create({
  checkboxWrapper: {
    width: 15,
    height: 15,
    borderWidth: 1.5,
    borderRadius: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
