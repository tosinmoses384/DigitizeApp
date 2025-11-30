import React from "react";
import { StyleSheet, View } from "react-native";
import AppTextInput from "./AppTextInput";
interface ISearchDropdown {
  handleChange: any;
  value: any;
  error: any;
}
const SearchDropdown = ({ handleChange, value, error }: ISearchDropdown) => {
  return (
    <View>
      <AppTextInput
        onChangeText={handleChange}
        value={value}
        error={error}
        placeholder="Full Name"
        label="Full Name"
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default SearchDropdown;
