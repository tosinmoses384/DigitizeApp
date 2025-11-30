import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface LoadingSkeletonProps {
  count?: number;
}

const SkeletonItem = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonItem}>
      <Animated.View style={[styles.skeletonImage, { opacity }]} />
      <Animated.View style={[styles.skeletonText, { opacity }]} />
      <Animated.View style={[styles.skeletonTextShort, { opacity }]} />
    </View>
  );
};

const LoadingSkeleton = React.memo<LoadingSkeletonProps>(({ count = 6 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default LoadingSkeleton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  skeletonItem: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
    elevation: 2,
    shadowOpacity: 1,
    padding: 8,
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonText: {
    width: '80%',
    height: 14,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    marginBottom: 6,
  },
  skeletonTextShort: {
    width: '50%',
    height: 12,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
  },
});
