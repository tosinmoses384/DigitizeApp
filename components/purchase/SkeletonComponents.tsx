import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const WIDTH = Dimensions.get("window").width;

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}

/**
 * Reusable Skeleton Box Component with shimmer effect
 * 
 * @example
 * ```tsx
 * <SkeletonBox width="100%" height={50} borderRadius={12} />
 * <SkeletonBox width={120} height={16} marginBottom={8} />
 * ```
 */
export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius = 8,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnimation]);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: [-WIDTH, WIDTH],
  });

  return (
    <View
      style={[
        styles.skeletonBox,
        {
          width: width as any,
          height,
          borderRadius,
          marginTop,
          marginBottom,
          marginLeft,
          marginRight,
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
};

/**
 * Skeleton for Order Summary Card
 */
export const OrderSummarySkeleton: React.FC = () => (
  <View style={styles.card}>
    <SkeletonBox width={150} height={18} marginBottom={16} />
    <SkeletonBox width="100%" height={14} marginBottom={8} />
    <SkeletonBox width="100%" height={14} marginBottom={8} />
    <SkeletonBox width="80%" height={14} marginBottom={16} />
    <View style={styles.divider} />
    <SkeletonBox width="100%" height={20} marginTop={12} />
  </View>
);

/**
 * Skeleton for Delivery Option Card
 */
export const DeliveryOptionSkeleton: React.FC = () => (
  <View style={styles.card}>
    <SkeletonBox width={120} height={16} marginBottom={16} />
    <View style={styles.row}>
      <SkeletonBox width={24} height={24} borderRadius={12} />
      <SkeletonBox width={100} height={14} marginLeft={12} />
    </View>
    <SkeletonBox width="100%" height={80} marginTop={12} borderRadius={8} />
  </View>
);

/**
 * Skeleton for Delivery Details Card
 */
export const DeliveryDetailsSkeleton: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <SkeletonBox width={40} height={40} borderRadius={8} />
      <View style={styles.flex}>
        <SkeletonBox width="70%" height={14} marginBottom={8} marginLeft={12} />
        <SkeletonBox width="50%" height={12} marginLeft={12} />
      </View>
      <SkeletonBox width={24} height={24} borderRadius={12} />
    </View>
  </View>
);

/**
 * Skeleton for Contact Details Card
 */
export const ContactDetailsSkeleton: React.FC = () => (
  <View style={styles.card}>
    <SkeletonBox width={140} height={16} marginBottom={12} />
    <View style={styles.row}>
      <SkeletonBox width="60%" height={14} />
      <SkeletonBox width={24} height={24} borderRadius={12} />
    </View>
  </View>
);

/**
 * Skeleton for Item Images
 */
export const ItemImagesSkeleton: React.FC = () => (
  <View style={styles.section}>
    <SkeletonBox width="100%" height={200} borderRadius={12} marginBottom={8} />
  </View>
);

/**
 * Skeleton for Shipping Address Card
 */
export const ShippingAddressSkeleton: React.FC = () => (
  <View style={styles.addressCard}>
    <SkeletonBox width="70%" height={14} marginBottom={8} />
    <SkeletonBox width="90%" height={12} marginBottom={6} />
    <SkeletonBox width="60%" height={12} />
  </View>
);

const styles = StyleSheet.create({
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  section: {
    marginBottom: 8,
  },
  addressCard: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  flex: {
    flex: 1,
  },
});

export default SkeletonBox;
