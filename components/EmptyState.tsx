import React from "react";
import { View, Text, StyleSheet } from "react-native";
import EmptyStateIcon from "../assets/images/svg/add-item-empty-state.svg";
import CustomButton from "./CustomButton";
import NewEptyStateSvg from "@assets/images/svg_components/new_emptyState";
interface IEmptyState {
  title?: string;
  subtitle?: string;
  otherText?: string;
  hasButton?: boolean;
  onPress?: any;
  buttonTitle?: string;
  icon?: any;
  subtitleStyle?: any;
  btnIcon?: any;
}
const EmptyState = ({
  title,
  subtitle,
  otherText,
  hasButton,
  onPress,
  buttonTitle,
  icon,
  subtitleStyle,
  btnIcon,
}: IEmptyState) => {
  return (
    <View style={styles.container}>
      <View>{icon || <NewEptyStateSvg />}</View>
      <Text style={styles.title}>
        {title || "You have not added any items yet."}
      </Text>
      <Text style={[styles.subtitle, subtitleStyle]}>
        {subtitle || "When you do, they will appear here"}
      </Text>
    
      {hasButton && (
        <View>
          <CustomButton
            buttonStyle={styles.btnStyle}
            textStyle={styles.btnText}
            title={buttonTitle || "Add Items"}
            onPress={onPress}
            icon={btnIcon}
          />
        </View>





      )}


{otherText && (
        <Text style={[styles.subtitle, subtitleStyle, {marginTop: 16}]}>
          {otherText || "When you do, they will appear here"}
        </Text>
      )}







    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    color: "rgba(33, 44, 61, 1)",
    fontFamily: "DMSansBold",
    marginBottom: 2,
    textAlign: "center",
    width: "100%",
  },
  subtitle: {
    color: "rgba(144, 149, 158, 1)",
    fontSize: 12,
    marginBottom: 12,
    textAlign: "center",
    width: "100%",
  },
  btnStyle: {
    backgroundColor: "rgba(255, 59, 74, 1)",
  },
  btnText: {
    color: "white",
  },
});
