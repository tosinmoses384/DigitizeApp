import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ChevronRightIcon from "@assets/images/svg/chevron-right-arrow.svg";
import { Ionicons } from '@expo/vector-icons';
import SelectItemBrandModal from "../modals/SelectItemBrandModal";
import SelectItemCategoryModal from "../modals/SelectItemCategoryModal";
interface ISelectWithDrawer {
  onPress?: any;
  error?: any;
  value: string;
  activeColor?: string;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  helperText?: string;
}
const SelectWithDrawer = ({
  onPress,
  value,
  error,
  activeColor,
  rightIcon,
  disabled = false,
  helperText,
}: ISelectWithDrawer) => {
  return (
    <View>
      <TouchableOpacity onPress={disabled ? undefined : onPress} disabled={disabled}>
        <View style={[
          styles.wrapper, 
          error ? styles.errorBorder : {},
          disabled ? styles.disabledWrapper : {}
        ]}>
          <Text
            style={[
              styles.title,
              { ...(activeColor ? { color: activeColor } : "") },
              disabled ? styles.disabledText : {}
            ]}
          >
            {value}
          </Text>
          <View>
            {rightIcon || <ChevronRightIcon width={20} height={20} />}
          </View>
        </View>
      </TouchableOpacity>

      {error && typeof error === 'string' && <Text style={styles.error}>{error}</Text>}
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

export default SelectWithDrawer;

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: 'transparent',
  },
  title: {
    color: "rgba(107, 114, 126, 1)",
    fontSize: 14,
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
  },
  error: {
    color: "rgb(241, 37, 37)",
    fontSize: 12,
  },
  errorBorder: {
    borderColor: 'red',
  },
  disabledWrapper: {
    backgroundColor: "rgba(245, 245, 245, 1)",
    opacity: 0.6,
  },
  disabledText: {
    color: "rgba(150, 150, 150, 1)",
  },
  helperText: {
    color: "rgba(107, 114, 126, 1)",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "DMSansRegular",
  },
});
