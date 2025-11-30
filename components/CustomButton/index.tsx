import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface ICustomButton {
  buttonStyle?: any;
  textStyle?: any;
  title: string;
  onPress?: any;
  loader?: boolean;
  icon?: any;
  iconPosition?: "left" | "right";
  showLoadingText?: boolean;
  disabled?: boolean;
  loadingStyle?: any;
  variant?: "primary" | "secondary";
}
const CustomButton = ({
  buttonStyle,
  textStyle,
  title,
  onPress,
  loader,
  icon,
  iconPosition = "left",
  showLoadingText,
  disabled,
  loadingStyle,
  ...props
}: ICustomButton) => {
  return (
    <Pressable
      style={({ pressed }) => [pressed && !disabled && styles?.pressed]}
      onPress={!loader && onPress}
      disabled={disabled || loader}
    >
      <View
        style={
          loader
            ? [
                styles.disableButtonWrapper,
                showLoadingText && {
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                },
                loadingStyle,
              ]
            : [
                styles.wrapper,
                buttonStyle,
                props.variant === "primary" && {
                  backgroundColor: disabled ? "#CCC" : "#FF3B4A",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                },
              ]
        }
      >
        {loader ? (
          showLoadingText ? (
            <Text
              style={{
                fontFamily: "DMSansMedium",
                fontSize: 12,
                color: "white",
                textAlign: "center",
              }}
            >
              Loading...
            </Text>
          ) : (
            <ActivityIndicator color="#fff" />
          )
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {icon && iconPosition !== "right" && (
              <View style={{ marginRight: 8 }}>{icon}</View>
            )}
            <Text
              style={[
                styles.text,
                textStyle,
                props.variant === "primary" && {
                  color: "#FFFFFF",
                },
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === "right" && (
              <View style={{ marginLeft: 8 }}>{icon}</View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default CustomButton;
const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  wrapper: {
    padding: 14,
    borderRadius: 12,
  },
  text: {
    fontFamily: "DMSansMedium",
    fontSize: 12,
  },

  disableButtonWrapper: {
    backgroundColor: "rgba(255, 216, 219, 1)",
    padding: 14,
    borderRadius: 12,

    display: "flex",
    justifyContent: "center",
  },
  // disableButtonWrapper: {
  //   backgroundColor: "rgba(255, 216, 219, 1)",
  //   padding: 14,
  //   borderRadius: 12,

  //   display: "flex",
  //   justifyContent: "center",
  // },
  // disableText: {
  //   fontFamily: "DMSansMedium",
  //   fontSize: 12,
  //   color: "#FF9DA4",
  //   textAlign: "center",
  //   width: "100%",
  // },
});
