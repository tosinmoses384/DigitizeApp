import React, { ReactNode } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
interface IContentSwitch {
  switchValue: boolean;
  handleSwitch: any;
  title: string | ReactNode;
  titleStyle?: any;
}
const ContentSwitch = ({
  switchValue,
  handleSwitch,
  title,
  titleStyle,
}: IContentSwitch) => {
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.text, titleStyle]}>{title}</Text>
      <View>
        <Switch
          trackColor={{
            false: "rgba(203, 214, 224, 1)",
            true: "rgba(255, 59, 74, 1)",
          }}
          thumbColor={switchValue ? "white" : "rgba(255, 255, 255, 1)"}
          ios_backgroundColor="rgba(245, 245, 245, 1)"
          onValueChange={handleSwitch}
          value={switchValue}
          style={{ padding: 0 }}
        />
      </View>
    </View>
  );
};

export default ContentSwitch;

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 12,
    flexDirection: "row",

    alignItems: "center",
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: "#393939",
  },
});
