import React, { useRef, memo } from "react";
import { Pressable, StyleSheet, Text, View, Animated } from "react-native";

interface AnimatedImageMessageProps {
  imageUrl: string;
  content?: string;
  onPress: () => void;
}

const AnimatedImageMessage = memo(({
  imageUrl,
  content,
  onPress,
}: AnimatedImageMessageProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Entrance animation with bounce
    Animated.sequence([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Shimmer effect - single run only
    Animated.timing(shimmerAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim, slideAnim, shimmerAnim]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.imageContainer}
      >
        <Animated.Image
          source={{ uri: imageUrl }}
          style={[styles.imageMessage]}
        />
        {content && (
          <Animated.View
            style={{
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text style={styles.messageText}>{content}</Text>
          </Animated.View>
        )}

        {/* Animated shimmer overlay */}
        <Animated.View
          style={[
            styles.shimmerOverlay,
            {
              transform: [{ translateX: shimmerTranslateX }],
            },
          ]}
        />

        {/* Tap indicator overlay */}
        <View style={styles.tapIndicator}>
          <Text style={styles.tapText}>📷</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

AnimatedImageMessage.displayName = 'AnimatedImageMessage';

export default AnimatedImageMessage;

const styles = StyleSheet.create({
  imageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 50,
    pointerEvents: "none",
  },
  tapIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  tapText: {
    fontSize: 12,
    opacity: 0.8,
  },
  messageText: {
    color: "#131111",
    fontFamily: "DMSansRegular",
  },
});
