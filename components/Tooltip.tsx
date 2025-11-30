import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

interface TooltipProps {
  containerStyles?: ViewStyle;
  direction?: "left" | "right" | "bottom" | "top";
  label: string;
  onClose: () => void;
}
const Tooltip = ({
  containerStyles,
  label,
  onClose,
  direction,
}: TooltipProps) => {
  const getContainerStyles = (): ViewStyle => {
    if (direction) return { [direction]: 0 };
    return {};
  };

  return (
    <View
      style={{
        position: "absolute",
        ...getContainerStyles(),
        ...containerStyles,
      }}
    >
      <View style={styles.tooltipContainer}>
        <Text style={styles.tooltipText}>{label}</Text>
        <TouchableOpacity onPress={onClose} style={styles.tooltipCloseBtn}>
          <Ionicons name="close" size={24} color="rgba(75, 74, 74, 1)" />
        </TouchableOpacity>
      </View>

      <View style={styles.tooltip}>
        <Ionicons name="caret-back-sharp" size={30} color="#fff" />
      </View>
    </View>
  );
};

export default Tooltip;

const styles = StyleSheet.create({
  tooltipText: {
    color: "#1C2533",
    maxWidth: "90%",
    fontSize: 12,
    fontFamily: "DMSansSemiBold",
  },
  tooltipContainer: {
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  tooltipCloseBtn: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  tooltip: {
    position: "absolute",
    left: 20,
    bottom: -20,
    transform: [{ rotate: "-90deg" }],
  },
});
