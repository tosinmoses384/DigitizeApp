import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const WIDTH = Dimensions.get("window").width;

const PurchaseSkeleton = () => {
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

  const SkeletonBox = ({
    width,
    height,
    borderRadius = 8,
    marginTop = 0,
    marginBottom = 0,
  }: {
    width: number | string;
    height: number;
    borderRadius?: number;
    marginTop?: number;
    marginBottom?: number;
  }) => (
    <View
      style={[
        styles.skeletonBox,
        {
          width: width as any,
          height,
          borderRadius,
          marginTop,
          marginBottom,
        },
      ]}
    >
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

  return (
    <View style={styles.container}>
      {/* Item Images Skeleton */}
      <View style={styles.section}>
        <SkeletonBox width="100%" height={200} borderRadius={12} marginBottom={16} />
      </View>

      {/* Order Summary Skeleton */}
      <View style={styles.card}>
        <SkeletonBox width={150} height={18} marginBottom={16} />
        <SkeletonBox width="100%" height={14} marginBottom={8} />
        <SkeletonBox width="100%" height={14} marginBottom={8} />
        <SkeletonBox width="80%" height={14} marginBottom={16} />
        <View style={styles.divider} />
        <SkeletonBox width="100%" height={20} marginTop={12} />
      </View>

      {/* Delivery Options Skeleton */}
      <View style={styles.card}>
        <SkeletonBox width={120} height={16} marginBottom={16} />
        <View style={styles.deliveryOption}>
          <SkeletonBox width={24} height={24} borderRadius={12} />
          <SkeletonBox width={100} height={14} marginBottom={0} />
        </View>
        <SkeletonBox width="100%" height={80} marginTop={12} borderRadius={8} />
      </View>

      {/* Delivery Details Skeleton */}
      <View style={styles.card}>
        <View style={styles.row}>
          <SkeletonBox width={40} height={40} borderRadius={8} />
          <View style={styles.flex}>
            <SkeletonBox width="70%" height={14} marginBottom={8} />
            <SkeletonBox width="50%" height={12} />
          </View>
          <SkeletonBox width={24} height={24} borderRadius={12} />
        </View>
      </View>

      {/* Contact Details Skeleton */}
      <View style={styles.card}>
        <SkeletonBox width={140} height={16} marginBottom={12} />
        <View style={styles.row}>
          <SkeletonBox width="60%" height={14} />
          <SkeletonBox width={24} height={24} borderRadius={12} />
        </View>
      </View>

      {/* Pay Button Skeleton */}
      <View style={styles.buttonContainer}>
        <SkeletonBox width="100%" height={50} borderRadius={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  skeletonBox: {
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
    width: WIDTH,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
    paddingTop: 16,
    paddingBottom: 30,
    backgroundColor: "white",
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
});

export default PurchaseSkeleton;
