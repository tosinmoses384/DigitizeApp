import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import CheckboxInput from "./CheckboxInput";
interface ICategoryList {
  title: string;
  subtitle: string;
  isChecked: boolean;
  onPress: any;
  loader?: boolean;
  subtitleTextStyle?: any;
}
const CategoryList = ({
  title,
  subtitle,
  isChecked,
  onPress,
  loader,
  subtitleTextStyle,
}: ICategoryList) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.titleAndSubtitleView}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.subtitle, subtitleTextStyle]}>{subtitle}</Text>
      </View>
      <Pressable
        disabled={loader}
        style={({ pressed }) => [styles.action, pressed && styles?.pressed]}
        onPress={onPress}
      >
        {loader ? <Text>...</Text> : <CheckboxInput checked={isChecked} />}
      </Pressable>
    </View>
  );
};

export default CategoryList;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(237, 242, 247, 1)",
    flexDirection: "row",
  },
  titleAndSubtitleView: {
    flex: 1,
  },
  action: {
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 12,
    color: "rgba(33, 43, 54, 1)",
    fontFamily: "DMSansMedium",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(144, 149, 158, 1)",
    textTransform: "capitalize",
  },
});
