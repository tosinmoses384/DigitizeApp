import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from "react-native";

interface IUploadButton {
  title: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: any;
}

const UploadButton = ({
  title,
  onPress,
  icon,
  disabled,
  style,
}: IUploadButton) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.text}>{title}</Text>
      </View>
    </Pressable>
  );
};

export default UploadButton;

const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 24,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#464F5D",
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#464F5D",
    fontFamily: "DMSans",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 18,
    flex: 1,
  },
});
