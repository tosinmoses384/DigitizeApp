import React, { memo } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentTabScrollY } from "react-native-collapsible-tab-view";

type Props = {
  children: React.ReactNode;
};

function SellerProfileAnimatedHeader(props: Props): React.JSX.Element {
  const currentTabScrollY = useCurrentTabScrollY();
  const safeAreaInsets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      currentTabScrollY.value,
      [0, 350, 400],
      [0, 0, 1],
      "clamp",
    );

    const translateY = withSpring(
      interpolate(
        currentTabScrollY.value,
        [0, 350, 400],
        [-500, -500, 0],
        "clamp",
      ),
      { damping: 20 },
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: safeAreaInsets.top },
        animatedStyle,
      ]}
    >
      {props.children}
    </Animated.View>
  );
}

export default memo(SellerProfileAnimatedHeader);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
});
