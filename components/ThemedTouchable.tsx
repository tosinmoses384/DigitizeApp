import { useThemeColor } from "../hooks/useThemeColor";
import {
  View,
  type ViewProps,
  type TouchableOpacityProps,
  TouchableOpacity,
} from "react-native";

export type ThemedViewProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedTouchableView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <TouchableOpacity style={[{ backgroundColor }, style]} {...otherProps} />
  );
}
