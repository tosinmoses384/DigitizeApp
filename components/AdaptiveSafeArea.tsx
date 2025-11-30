import React from "react";
import { SafeAreaView, StyleSheet, useColorScheme, View } from "react-native";

interface AdaptiveSafeAreaProps {
  children: React.ReactNode;
  style?: any; // Allow additional styles
}

const AdaptiveSafeArea = ({ children, style }: AdaptiveSafeAreaProps) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkMode ? "white" : "black",
      ...style, // Apply additional styles
    },
  });

  return <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>;
};

export default AdaptiveSafeArea;
