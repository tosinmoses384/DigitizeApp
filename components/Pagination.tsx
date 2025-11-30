import { StyleSheet, View } from "react-native";
import React from "react";
import { SharedValue } from "react-native-reanimated";
import { OnboardingData } from "../constants/Data";
import Segment from "./Segment";

type Props = {
  data: OnboardingData[];
  progress: SharedValue<number>;
  currentIndex: SharedValue<number>;
  loopProgress: SharedValue<number>;
  activeColor?: string;
  inactiveColor?: string;
};

const Pagination = ({
  data = [],
  progress,
  currentIndex,
  loopProgress,
  activeColor = "#FF3B4A",
  inactiveColor = "#FFD8DB",
}: Props) => {
  const total = data.length;
  
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => {
        return (
          <Segment
            index={index}
            progress={progress}
            currentIndex={currentIndex}
            loopProgress={loopProgress}
            key={index}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            total={total}
          />
        );
      })}
    </View>
  );
};

export default React.memo(Pagination);

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
});
