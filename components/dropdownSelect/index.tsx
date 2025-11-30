import React from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
interface IDropdownSelect {
  data: any;
  setSelected: any;
  selected: any;
  label?: string;
  placeholder?: string;
  loading?: boolean;
  customStyles?: {
    container?: object;
    boxStyles?: object;
    inputStyles?: object;
    labelStyles?: object;
  };
}
export const DropdownSelect = ({
  data,
  setSelected,
  selected,
  label,
  placeholder,
  loading,
  customStyles,
}: IDropdownSelect) => {
  const defaultValue = data?.find(
    (list: any) => list.value === selected || list.key === selected
  );

  return (
    <View>
      <Text style={[styles.label, customStyles?.labelStyles]}>{label}</Text>
      <View style={[
        { backgroundColor: "white", borderRadius: 8, position: 'relative' },
        customStyles?.container
      ]}>
        <SelectList
          setSelected={loading ? () => {} : (val: any) => setSelected(val)}
          data={loading ? [] : data}
          save="value"
          searchPlaceholder={loading ? "Loading..." : placeholder}
          defaultOption={defaultValue}
          inputStyles={{
            ...(loading 
              ? styles.inputDisabledStyle 
              : selected 
                ? styles.inputStyle 
                : styles.inputEmptyStyle),
            ...customStyles?.inputStyles
          }}
          placeholder={loading ? "Loading states..." : placeholder || "Select Bank"}
          dropdownStyles={{
            position: "absolute",
            top: 40,
            zIndex: 3,
            backgroundColor: "white",
            width: "100%",
          }}
          boxStyles={{
            borderColor: "white",
            paddingLeft: 10,
            paddingRight: loading ? 50 : 30, // Extra space for loading indicator
            paddingTop: 15,
            height: 50,
            opacity: loading ? 0.6 : 1,
            ...customStyles?.boxStyles
          }}
        />
        {loading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#666" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputStyle: {
    width: "100%",
    height: 27,
    fontSize: 14,
    color: "#212B36",
  },
  label: {
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "rgba(53, 53, 53, 1)",
    marginBottom: 6,
  },
  inputEmptyStyle: {
    fontSize: 14,
    color: "#868E96",
  },
  inputDisabledStyle: {
    color: "#C4C4C4",
    fontSize: 14,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -10,
    zIndex: 4,
  },
});
