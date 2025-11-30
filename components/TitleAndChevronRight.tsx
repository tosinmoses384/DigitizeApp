import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ChevronRight from "../assets/images/svg/chevron-right-arrow.svg";
interface ITitleAndChevronRight {
  title: string | ReactNode;
  endTitle?: string;
  customStyle?: any;
  onPress?: any;
  middleText?: string;
  bottomTitle?: string;
  iconTextRight?: string;
}
const TitleAndChevronRight = ({
  title,
  endTitle,
  customStyle,
  onPress,
  middleText,
  bottomTitle,
  iconTextRight,
}: ITitleAndChevronRight) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.wrapper,
        customStyle,
        { opacity: pressed && onPress ? 0.5 : 1 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.titleView}>
        <Text style={styles.title}>{title}</Text>
        {middleText && <Text style={styles.middleText}>{middleText}</Text>}
        {bottomTitle && <Text style={styles.middleText}>{bottomTitle}</Text>}
      </View>
      <View style={styles.endView}>
        {endTitle && (
          <Text style={styles.endTitle} numberOfLines={1} ellipsizeMode="tail">
            {endTitle}
          </Text>
        )}

        <View style={styles.iconAndText}>
          {iconTextRight && (
            <Text
              style={styles.textIcon}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {iconTextRight}
            </Text>
          )}

          {onPress && <ChevronRight width={16} height={16} />}
        </View>
      </View>
    </Pressable>
  );
};

export default TitleAndChevronRight;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    paddingVertical: 13,
    backgroundColor: "white",
    alignItems: "center",
  },
  titleView: {
    flex: 1,
  },
  title: {
    color: "#393939",
    fontSize: 12,
    marginRight: 10,
    textTransform: "capitalize",
  },
  middleText: {
    fontSize: 10,
    color: "#5C6F7F",
    marginTop: 4,
    textTransform: "capitalize",
  },
  endView: {
    flexDirection: "row",
  },
  endTitle: {
    fontSize: 12,
    color: "#90959E",
    marginRight: 8,
    width: 110,
    textTransform: "capitalize",
  },
  iconAndText: {
    flexDirection: "row",
    alignItems: "center",
  },
  textIcon: {
    maxWidth: 111,
    color: "#90959E",
    fontSize: 12,
  },
});
