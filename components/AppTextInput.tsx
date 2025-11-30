import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useState } from "react";
import { View, TextInput, StyleSheet, Text, TextInputProps, ViewStyle, TextStyle } from "react-native";

import EyeOpenIcon from "../assets/images/svg/eyesOpen.svg";
import { Colors } from "../constants/Colors";

interface IAppTextInput extends Omit<TextInputProps, 'onChangeText' | 'value' | 'style'> {
  value: any;
  type?: string;
  onChangeText: (value: any) => void;
  error?: any;
  placeholder: string;
  label?: string;
  keyboardType?: any;
  isMultiline?: boolean;
  labelStyle?: any;
  iconRight?: any;
  isShowInnerLabel?: boolean;
  inputHeight?: number;
  inputStyle?: ViewStyle | TextStyle;
  containerStyle?: ViewStyle;
  placeholderTextColor?: string;
  errorMessageStyle?: TextStyle;
  customBackgroundColor?: string;
  customBorderRadius?: number;
  multilineHeight?: number;
}

const AppTextInput = forwardRef<TextInput, IAppTextInput>(({
  value,
  type,
  onChangeText,
  error,
  placeholder,
  label,
  keyboardType,
  isMultiline,
  labelStyle,
  iconRight,
  isShowInnerLabel,
  inputHeight,
  inputStyle: customInputStyle,
  containerStyle,
  placeholderTextColor: customPlaceholderColor,
  errorMessageStyle,
  customBackgroundColor,
  customBorderRadius,
  multilineHeight,
  ...restProps
}, ref) => {
  const [passwordMask, setPasswordMask] = useState(true);

  const errorAndValueCheck =
    value && error ? styles.errorInputWithValue : styles.errorInputWithOutValue;
  const inputWithoutErrorCheck = value
    ? styles.inputWithValue
    : styles.inputWithOutValue;
  const styleRenderType = error ? errorAndValueCheck : inputWithoutErrorCheck;

  const rootInputStyle = error ? styles.errorInput : styles.inputStyle;
  
  const defaultPlaceholderColor = error 
    ? "rgb(241, 37, 37)" 
    : customPlaceholderColor || "rgba(145, 158, 171, 1)";

  const baseInputStyle = [
    rootInputStyle,
    styleRenderType,
    customBackgroundColor && { backgroundColor: customBackgroundColor },
    customBorderRadius && { borderRadius: customBorderRadius },
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.wrapper}>
        {!isShowInnerLabel && label && (
          <Text style={[labelStyle, styles.label]}>{label}</Text>
        )}
        {!isMultiline && (
          <View style={{ position: "relative" }}>
            {isShowInnerLabel && label && value && (
              <Text style={[labelStyle, styles.innerLabel]}>{label}</Text>
            )}
            <TextInput
              ref={ref}
              value={value}
              style={[
                ...baseInputStyle,
                isShowInnerLabel && value && { paddingTop: 24 },
                { height: inputHeight || 53 },
                customInputStyle,
              ]}
              placeholder={placeholder}
              selectionColor={
                error ? "rgb(241, 37, 37)" : "rgba(33, 43, 54, .3)"
              }
              autoCapitalize={"none"}
              autoCorrect={false}
              placeholderTextColor={defaultPlaceholderColor}
              secureTextEntry={type !== "password" ? false : passwordMask}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              {...restProps}
            />
            {iconRight && <View style={styles.rightIcon}>{iconRight}</View>}
          </View>
        )}

        {type === "password" && (
          <View style={styles.iconContainer}>
            <Text onPress={() => setPasswordMask(!passwordMask)}>
              <Ionicons
                name={passwordMask ? "eye" : "eye-off"}
                size={20}
                color={Colors.light.disabled}
              />
            </Text>
          </View>
        )}
        {isMultiline && (
          <TextInput
            ref={ref}
            style={[
              ...baseInputStyle,
              styles.multilineInput,
              multilineHeight && { height: multilineHeight },
              {
                paddingTop: 10,
              },
              customInputStyle,
            ]}
            placeholder={placeholder}
            multiline
            textAlignVertical="top"
            value={value}
            selectionColor={error ? "rgb(241, 37, 37)" : "rgba(33, 43, 54, .3)"}
            autoCapitalize={"none"}
            autoCorrect={false}
            placeholderTextColor={defaultPlaceholderColor}
            onChangeText={onChangeText}
            numberOfLines={5}
            {...restProps}
          />
        )}
      </View>
      {error && <Text style={[styles.errorMessage, errorMessageStyle]}>{error}</Text>}
    </View>
  );
});

AppTextInput.displayName = 'AppTextInput';

export default AppTextInput;

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  label: {
    // position: "absolute",
    // paddingLeft: 12,
    // top: 6,
    fontSize: 14,
    fontFamily: "DMSansMedium",
    color: "rgba(53, 53, 53, 1)",
    marginBottom: 6,
  },
  innerLabel: {
    position: "absolute",
    top: 7,
    zIndex: 1,
    color: "#637381",
    fontSize: 12,
    left: 12,
  },
  inputStyle: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 1)",
    height: 53,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: 14,
  },
  multilineInput: {
    height: 100,
    maxHeight: 150,
  },
  errorInput: {
    width: "100%",
    backgroundColor: "rgba(145, 158, 171, 0.08)",
    height: 53,
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 12,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: "rgb(241, 37, 37)",
  },
  errorInputWithValue: {
    // paddingTop: 19,

    fontFamily: "DMSansSemiBold",
    color: "rgb(241, 37, 37)",
  },
  errorInputWithOutValue: {
    paddingTop: "auto",

    fontFamily: "DMSansSemiLight",
  },
  inputWithValue: {
    // paddingTop: 19,

    fontFamily: "DMSansSemiBold",
  },
  inputWithOutValue: {
    paddingTop: "auto",
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    top: "30%",
  },
  errorMessage: {
    fontSize: 12,
    color: "rgb(241, 37, 37)",
    marginTop: 5,
  },
  rightIcon: {
    position: "absolute",
    right: 25,
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
});
