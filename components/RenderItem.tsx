import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React from "react";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { OnboardingData } from "../constants/Data";
import { fontSz } from "../constants";

type Props = {
  index: number;
  x: SharedValue<number>;
  item: OnboardingData | any;
};

const RenderItem = ({ index, x, item }: Props) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const circleAnimation = useAnimatedStyle(() => {
    const scale = interpolate(
      x.value,
      [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ],
      [1, 4, 4],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale: scale }],
    };
  });

  return (
    <View style={[styles.itemContainer, { width: SCREEN_WIDTH }]}>
     
      <View style={{ flex: 1 }}>
        <View style={styles.circleContainer}>
          <Animated.View
            style={[
              {
                width: SCREEN_WIDTH,
                flex: 1,
                height: "100%",
                borderRadius: SCREEN_WIDTH / 2,
                backgroundColor: item.backgroundColor,
              },
              circleAnimation,
            ]}
          />
        </View>
        <Animated.View style={{ flex: 1 }}>
        <View style={{ marginTop: 100, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 ,zIndex: 2000, marginHorizontal: 20 }}>
        <Text style={[styles.itemText]}>{item.text}</Text>
        <Text style={[styles.itemBody]}>{item.bodyText}</Text>
      </View>


          <Image
            source={item.animation}
            style={{
              // width: SCREEN_WIDTH,
              width: "100%",
              // height: SCREEN_HEIGHT * 0.7,
              height: "100%",

              resizeMode: "stretch",
            }}
          />
        </Animated.View>
      </View>
      {/* style={{ marginTop: 70 }} */}
   
    </View>
  );
};

export default RenderItem;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
  },
  itemText: {
    //textAlign: "center",
   // marginHorizontal: 20,
    fontSize: 24,
    fontFamily: "DMSansExtraBold",
    marginBottom: 8,
    color: "#ffffff",
  },
  itemBody: {
   // textAlign: "center",
    fontSize: fontSz(16),
   // marginHorizontal: 60,
    fontFamily: "DMSansRegular",
    width: "100%",
    
    color: "#ffffff",
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
