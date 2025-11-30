import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
const WIDTH = Dimensions.get("window").width;
interface ILineLoader {
  loaderStyle?: any;
}
const LineLoader = ({ loaderStyle }: ILineLoader) => {
  const shimmerAnimation = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: [-WIDTH, WIDTH],
  });

  return (
    <View style={loaderStyle || styles.skeletonTitle}>
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0.6)",
            "rgba(52, 50, 50, 0.2)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

export default LineLoader;

const styles = StyleSheet.create({
  skeletonTitle: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,

    // marginBottom: 5,
    overflow: "hidden",
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
});
