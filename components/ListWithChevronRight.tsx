import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ChevronRight from "../assets/images/svg/chevron-right-arrow.svg";
interface IListWithChevronRight {
  title: string;
  onPress?: () => void;
}
const ListWithChevronRight = ({ title, onPress }: IListWithChevronRight) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.wrapper,
        { ...(pressed ? { opacity: 0.5 } : "") },
      ]}
      onPress={onPress}
    >
      <Text style={styles.title}>{title}</Text>
      <View>
        <ChevronRight />
      </View>
    </Pressable>
  );
};

export default ListWithChevronRight;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "white",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "rgba(237, 242, 247, 1)",
    flexDirection: "row",
  },
  title: {
    fontSize: 12,
    color: "rgba(57, 57, 57, 1)",
    flex: 1,
    textTransform: "capitalize",
  },
});
