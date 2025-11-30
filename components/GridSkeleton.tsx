import React, { useRef, useEffect } from "react";
import {
  Animated,
  View,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const WIDTH = Dimensions.get("window").width;

const GridSkeleton = () => {
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

  const ShimmerOverlay = () => (
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
  );

  const GridItemSkeleton = () => (
    <View style={styles.gridItemContainer}>
      {/* Item Image Skeleton */}
      <View style={styles.skeletonImage}>
        <ShimmerOverlay />
      </View>

      {/* Bottom Section Skeleton */}
      <View style={styles.bottomSection}>
        {/* User Info Skeleton */}
        <View style={styles.userInfo}>
          {/* Profile Picture Skeleton */}
          <View style={styles.skeletonProfileImage}>
            <ShimmerOverlay />
          </View>
          
          {/* Username Skeleton */}
          <View style={styles.skeletonUsername}>
            <ShimmerOverlay />
          </View>
        </View>

        {/* Like Section Skeleton */}
        <View style={styles.likeSection}>
          <View style={styles.skeletonLikeIcon}>
            <ShimmerOverlay />
          </View>
          <View style={styles.skeletonLikeCount}>
            <ShimmerOverlay />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Generate multiple rows of grid items */}
      {Array.from({ length: 3 }).map((_, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          <GridItemSkeleton />
          <GridItemSkeleton />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingBottom: 50,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItemContainer: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 0.88,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonProfileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  skeletonUsername: {
    width: 60,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  likeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonLikeIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginRight: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  skeletonLikeCount: {
    width: 20,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
});

export default GridSkeleton;
