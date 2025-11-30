import React, { useRef, useEffect } from "react";
import {
  Animated,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const WIDTH = Dimensions.get("window").width;

const SkeletonLoader = () => {
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
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Skeleton for the Image */}

      <View style={[styles.skeletonImage, { marginTop: 20 }]}>
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

      {/* Skeleton for the Title */}
      <View style={styles.skeletonTitle}>
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

      {/* Skeleton for the Subtitle */}
      <View style={styles.skeletonSubtitle}>
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

      <View style={[styles.skeletonImage, { marginTop: 20 }]}>
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

      {/* Skeleton for the Title */}
      <View style={styles.skeletonTitle}>
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

      {/* Skeleton for the Subtitle */}
      <View style={styles.skeletonSubtitle}>
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

      <View style={[styles.skeletonImage, { marginTop: 20 }]}>
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

      {/* Skeleton for the Title */}
      <View style={styles.skeletonTitle}>
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

      {/* Skeleton for the Subtitle */}
      <View style={styles.skeletonSubtitle}>
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
      <View style={[styles.skeletonImage, { marginTop: 20 }]}>
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

      {/* Skeleton for the Title */}
      <View style={styles.skeletonTitle}>
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

      {/* Skeleton for the Subtitle */}
      <View style={styles.skeletonSubtitle}>
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
      <View style={[styles.skeletonImage, { marginTop: 20 }]}>
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

      {/* Skeleton for the Title */}
      <View style={styles.skeletonTitle}>
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

      {/* Skeleton for the Subtitle */}
      <View style={styles.skeletonSubtitle}>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  skeletonImage: {
    width: WIDTH - 30,
    height: 150,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  skeletonTitle: {
    width: WIDTH - 50,
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 5,
    overflow: "hidden",
  },
  skeletonSubtitle: {
    width: WIDTH - 100,
    height: 20,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 5,
    overflow: "hidden",
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
});

export default SkeletonLoader;
