import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

const AppPreviewLoader = () => {
  const logo = require("../../assets/images/logo-one.png");
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity value is 0 (transparent)

  // Function to handle the fade animation loop
  const startFadeAnimation = () => {
    Animated.loop(
      Animated.sequence([
        // Fade In: from 0 to 1 opacity
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000, // 1 second to fade in
          useNativeDriver: true,
        }),
        // Fade Out: from 1 to 0 opacity
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000, // 1 second to fade out
          useNativeDriver: true,
        }),
      ])
    ).start(); // Start the animation loop
  };

  // Trigger the fade animation automatically when the component mounts
  useEffect(() => {
    startFadeAnimation(); // Start fading in and out automatically
  }, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.iconAndText}>
        <Animated.View
          style={[
            {
              opacity: fadeAnim, // Bind opacity to animated value
            },
          ]}
        >
          <Image source={logo} width={73} height={94} />
        </Animated.View>
        <Text style={styles.content}>Almost there... Just a moment</Text>
      </View>
    </View>
  );
};

export default AppPreviewLoader;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
  },
  iconAndText: {
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  content: {
    fontSize: 12,
    color: "rgba(99, 115, 129, 1)",
    marginTop: 35,
  },
});
