import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
interface ISideDrawer {
  children: ReactNode;
}
const SideDrawer = ({ children }: ISideDrawer) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.body}>{children}</View>
    </View>
  );
};

export default SideDrawer;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "green",
    position: "absolute",
    height: "100%",
    width: "100%",
    // display: "flex",
    top: 0,
    bottom: 0,
    flex: 1,
    // justifyContent: "flex-end",
    // alignItems: "center",
  },
  body: {
    backgroundColor: "blue",
    width: "100%",
    boxShadow: "0px 2.79px 20.91px 0px rgba(0, 0, 0, 0.15)",
  },
});
