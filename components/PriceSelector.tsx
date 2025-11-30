import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ChevronRightIcon from "@assets/images/svg/chevron-right-arrow.svg";

interface PriceSelectorProps {
  onPress?: () => void;
  error?: any;
  value?: string;
  label?: string;
  currency?: string;
}

const PriceSelector: React.FC<PriceSelectorProps> = ({
  onPress,
  error,
  value,
  label = "Shipping Price",
  currency = "$",
}) => {
  const hasValue = value && value.length > 0;
  const formattedValue = hasValue ? `${currency}${parseFloat(value || "0").toFixed(2)}` : "";

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.wrapper, error ? styles.errorBorder : {}]}>
          <Text style={styles.label}>{label}</Text>
          
          <View style={styles.rightContent}>
            {hasValue && (
              <Text style={styles.value}>{formattedValue}</Text>
            )}
            <ChevronRightIcon width={20} height={20} />
          </View>
        </View>
      </TouchableOpacity>

      {error && typeof error === 'string' && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 1)",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    color: "rgba(107, 114, 126, 1)",
    fontSize: 14,
    fontFamily: "DMSansMedium",
    textTransform: "capitalize",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  value: {
    color: "#FF3B4A", // Red color for the price
    fontSize: 14,
    fontFamily: "DMSansMedium",
    fontWeight: "500",
  },
  error: {
    color: "rgb(241, 37, 37)",
    fontSize: 12,
    marginTop: 4,
  },
  errorBorder: {
    borderColor: 'red',
  },
});

export default PriceSelector;
