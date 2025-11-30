import React from "react";
import {
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  Pressable,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { primaryBase, white } from "../../constants/Colors";
import { WIDTH } from "../../constants/Layout";

interface FilledButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  color?: string;
  activeOpacity?: number;
  opacity?: number;
  disable?: boolean;
  loading?: boolean;
  gradient?: boolean;
}

const FilledButton: React.FC<FilledButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  backgroundColor,
  color = white,
  activeOpacity = 0.8,
  opacity = 1,
  disable = false,
  loading = false,
  gradient = false,
}) => {
  const styles = StyleSheet.create({
    container: {
      height: 50,
      width: WIDTH - 50,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    gradient: {
      position: "absolute",
      height: 50,
      width: WIDTH - 50,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 18,
      fontWeight: "400",
      fontFamily: "DMSansBold",
    },
    enabledTitle: {
      color: color,
    },
    disabledTitle: {
      color: "#FF9DA4",
    },
    enabledGradient: {
      colors: [primaryBase, primaryBase],
    },
    disabledGradient: {
      colors: ["#FFD8DB", "#FFD8DB"], // Disabled gradient colors
    },
    disabledBackground: {
      backgroundColor: "#FFD8DB", // Disabled solid background color
    },
    enabledBackground: {
      backgroundColor: backgroundColor || primaryBase, // Fallback to primary color
    },
  });

  return (
    <View style={{ opacity }}>
      {gradient && (
        <LinearGradient
          colors={
            disable
              ? styles.disabledGradient.colors
              : styles.enabledGradient.colors
          }
          style={[styles.gradient, style]}
        />
      )}
      <Pressable
        // activeOpacity={activeOpacity}
        disabled={disable}
        onPress={disable ? undefined : onPress}
        style={[
          styles.container,
          !gradient &&
            (disable ? styles.disabledBackground : styles.enabledBackground),
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={white} />
        ) : (
          <Text
            style={[
              styles.title,
              disable ? styles.disabledTitle : styles.enabledTitle,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

export default FilledButton;
