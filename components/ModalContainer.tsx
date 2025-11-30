import React from "react";
import { StyleSheet, Text, View } from "react-native";
interface IModalContainer {
  children: any;
  styleWrapper?: any;
  childrenContainer?: any;
}
const ModalContainer = ({
  children,
  styleWrapper,
  childrenContainer,
}: IModalContainer) => {
  return (
    <View style={styleWrapper || styles.wrapper}>
      <View style={childrenContainer || styles.childrenContainer}>
        {children}
      </View>
    </View>
  );
};

export default ModalContainer;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "rgba(187,187,189,.5)",
    position: "absolute",
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  childrenContainer: {
    width: "100%",
    maxHeight: "80%",
  },
});
