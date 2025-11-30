import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";
import { WIDTH } from "../../constants/Layout";
import { black, primaryBase } from "../../constants/Colors";

// Define the types for the props
interface TextButtonProps extends TouchableOpacityProps {
  title: string;
  title2?: string;
  titleColor?: string;
  title2Color?: string;
  loading?: boolean;
  titleStyle?: TextStyle;
  style?: ViewStyle;
}

const TextButton: React.FC<TextButtonProps> = ({
  title,
  title2,
  onPress,
  titleColor = primaryBase,
  title2Color = black,
  style,
  titleStyle,
  loading = false,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      {loading ? (
        <ActivityIndicator size="small" color={primaryBase} />
      ) : (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: titleColor }, titleStyle]}>
            {title}
          </Text>
          {title2 && (
            <Text style={[styles.title2, { color: title2Color }, titleStyle]}>
              {title2}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 50,
    width: WIDTH - 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flexDirection: "row",
  },
  title: {
    fontSize: 18,
    fontWeight: "400",
    fontFamily: "DMSansExtraBold",
  },
  title2: {
    fontSize: 18,
    fontWeight: "400",
    marginLeft: 8,
  },
});

export default TextButton;
