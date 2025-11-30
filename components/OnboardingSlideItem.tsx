import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { OnboardingData } from '../constants/Data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SlideItemProps {
  item: OnboardingData;
  index: number;
  x: SharedValue<number>;
  width?: number;
}

const SlideItem = ({ item, index, x, width = SCREEN_WIDTH }: SlideItemProps) => {
  const imageAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const scrollOffset = x.value / width;
    const diff = scrollOffset - index;

    // Parallax effect: Move image slightly in opposite direction
    const translateX = interpolate(
      diff,
      [-1, 0, 1],
      [width * 0.5, 0, -width * 0.5],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      diff,
      [-1, 0, 1],
      [1.2, 1, 1.2], // Slight zoom out when focused, zoom in when out
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      diff,
      [-0.5, 0, 0.5],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }, { scale }],
      opacity,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const scrollOffset = x.value / width;
    const diff = scrollOffset - index;

    const translateY = interpolate(
      diff,
      [-0.5, 0, 0.5],
      [20, 0, 20],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      diff,
      [-0.5, 0, 0.5],
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={[styles.itemContainer, { width }]}>
      <View style={styles.imageContainer}>
        <Animated.Image
          source={item.animation as unknown as number}
          style={[styles.image, imageAnimatedStyle]}
        />
      </View>
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={styles.itemText}>{item.text}</Text>
        <Text style={styles.itemBody}>{item.bodyText}</Text>
      </Animated.View>
    </View>
  );
};

export default React.memo(SlideItem);

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
  },
  textContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  itemText: {
    fontSize: 24,
    fontFamily: "DMSansExtraBold",
    marginBottom: 10,
    color: "#464F5D",
  },
  itemBody: {
    fontSize: 16,
    fontFamily: "DMSansRegular",
    color: "#464F5D",
  },
  imageContainer: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
