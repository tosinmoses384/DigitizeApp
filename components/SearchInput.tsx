import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import SearchIcon from "../assets/images/svg/search.svg";
interface ISearchInput {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}
const SearchInput = ({ value, onChangeText, placeholder }: ISearchInput) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.searchIconView}>
        <SearchIcon width={16} height={16} />
      </View>
      <TextInput
        placeholder={placeholder || "Search..."}
        style={styles.inputField}
        autoCapitalize={"none"}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        selectionColor={"rgba(33, 43, 54, .3)"}
        placeholderTextColor={"rgba(145, 158, 171, 1)"}
      />
    </View>
  );
};

SearchInput.displayName = "SearchInput";

export default React.memo(SearchInput);

const styles = StyleSheet.create({
  wrapper: {
    height: 40,
    position: "relative",
  },
  inputField: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(233, 234, 235, 1)",
    height: "100%",
    borderRadius: 16,
    paddingLeft: 40,
    fontSize: 14,
  },
  searchIconView: {
    position: "absolute",
    height: "100%",
    paddingLeft: 16,
    display: "flex",
    justifyContent: "center",
  },
});
