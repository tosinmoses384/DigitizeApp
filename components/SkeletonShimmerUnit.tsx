import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props extends ViewStyle {}

export default function SkeletonShimmerUnit(props: Props) {
  const shimmerAnimation = useRef(new Animated.Value(-1)).current;
  const windowDimensions = useWindowDimensions();
  const WIDTH = windowDimensions.width;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: [-WIDTH, WIDTH],
  });

  return (
    <View style={[styles.container, props]}>
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX: shimmerTranslate }] },
        ]}
      >
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.6)',
            'rgba(52, 50, 50, 0.2)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
  },
});
