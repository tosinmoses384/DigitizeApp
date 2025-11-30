import React from "react";
import {
  TouchableOpacity,
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
  borderColor?: string; // <-- New prop
}

const UnfilledButton: React.FC<FilledButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  backgroundColor = primaryBase,
  color = white,
  activeOpacity = 0.8,
  opacity = 1,
  disable = false,
  loading = false,
  gradient = false,
  borderColor = primaryBase,
}) => {
  const styles = StyleSheet.create({
    container: {
      height: 50,
      width: WIDTH - 50,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2, // <-- Added borderWidth
      borderColor: borderColor, // <-- Applied borderColor
    },
    gradient: {
      position: "absolute",
      height: 50,
      width: WIDTH - 40,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      color: primaryBase,
      fontSize: 18,
      fontWeight: "400",
      fontFamily: "DMSansRegular",
    },
  });

  return (
    <View style={{ opacity }}>
      {gradient && (
        <LinearGradient
          colors={[white, white]}
          style={[styles.gradient, style]}
        />
      )}
      <Pressable
        // activeOpacity={activeOpacity}
        disabled={disable}
        onPress={disable ? undefined : onPress}
        style={[styles.container, !gradient && { backgroundColor }, style]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={white} />
        ) : (
          <Text style={[styles.title, { color }, textStyle]}>{title}</Text>
        )}
      </Pressable>
    </View>
  );
};

export default UnfilledButton;
