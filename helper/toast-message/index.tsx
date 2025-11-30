import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import CheckMarkIcon from "../../assets/images/svg/circle-check-mark-Icon.svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { SIZES } from "@constants/Colors";
interface ICustomToastNotification {
  message: string | "";
  type: string | "info";
  autoHideDuration: 3000;
}
const CustomToastNotification = ({
  message,
  type,
  autoHideDuration,
}: ICustomToastNotification) => {
  const translateY = useSharedValue(-100);
  const isMounted = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    isMounted.current = true;
    setIsVisible(true);

    // Show the toast
    translateY.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    });

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      dismissToast();
    }, autoHideDuration);

    return () => {
      clearTimeout(timer);
      isMounted.current = false;
    };
  }, [autoHideDuration, translateY]);

  const dismissToast = useCallback(() => {
    translateY.value = withTiming(
      -100,
      { duration: 300, easing: Easing.in(Easing.ease) },
      () => {
        // Hide the component after animation

        runOnJS(setIsVisible)(false);
      }
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: isVisible ? 1 : 0,
    };
  });

  const backgroundColor =
    type === "success" ? "#F0FFF5" : type === "error" ? "red" : "orange";
  const textColor =
    type === "success" ? "#078550" : type === "error" ? "white" : "white";

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.container, { backgroundColor }, animatedStyle]}
    >
      {type === "success" && (
        <View style={{ marginRight: 12 }}>{<CheckMarkIcon />}</View>
      )}

      <View style={{ flexDirection: "row", flex: 1 }}>
        <Text
          style={[
            styles.message,
            { color: textColor, fontSize: 14, fontFamily: "DMSansMedium" },
          ]}
        >
          {message}
        </Text>
        <TouchableOpacity onPress={dismissToast} style={styles.closeButton}>
          <Ionicons
            name="close"
            color={textColor}
            size={20}
            style={{
              fontFamily: "DMSansMedium",
            }}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    right: 0,
    backgroundColor: "orange",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
    flexDirection: "row",
    // alignItems: "center",
    zIndex: 90000,
    marginHorizontal: 16,
  },
  message: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 10,
    padding: 5,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomToastNotification;
