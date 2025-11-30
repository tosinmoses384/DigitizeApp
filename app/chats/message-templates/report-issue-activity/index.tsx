import CustomButton from "@components/CustomButton";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Svg, Path, Circle } from "react-native-svg";
import { ActivityComponentProps } from "../types";

// Simple checkmark icon component
const CheckmarkIcon = ({
  size = 20,
  color = "#22C55E",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill={color} />
    <Path
      d="M6 10l2.5 2.5L14 7"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ReportIssueActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const metadata = message?.metadata;
  const disabled = metadata?.is_active === "False";
  const showIcon = metadata?.showIcon !== false;
  return (
    <View
      style={[
        styles.messageContainer,
        message?.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <View style={styles.headerContainer}>
        {showIcon && <CheckmarkIcon />}
        <Text style={styles.delivered}>Delivered</Text>
      </View>
      <Text style={styles.description}>
        You are confirming that the product has been delivered to the buyer. We
        will have to wait for confirmation from the buyer to ensure a successful
        sale.
      </Text>
      <View style={styles.buttonsWrapper}>
        {disabled ? (
          <View
            style={[styles.reportIssueButton, styles.reportIssueButtonDisabled]}
          >
            <Text
              style={[
                styles.reportIssueButtonText,
                styles.reportIssueButtonTextDisabled,
              ]}
            >
              Report an issue
            </Text>
          </View>
        ) : (
          <CustomButton
            title="Report an issue"
            buttonStyle={styles.reportIssueButton}
            textStyle={styles.reportIssueButtonText}
            onPress={() => {
              // TODO: Implement report issue functionality
              console.log("Report issue pressed");
            }}
          />
        )}
      </View>
    </View>
  );
};

export default ReportIssueActivity;

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    gap: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    borderColor: "#E9EAEB",
    borderWidth: 2,
    backgroundColor: "#FFF7F8",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderColor: "#E9EAEB",
    borderWidth: 2,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "stretch",
  },
  delivered: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    color: "#07090c",
    textAlign: "left",
  },
  description: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    color: "#464f5d",
    textAlign: "left",
    alignSelf: "stretch",
    lineHeight: 20,
  },
  buttonsWrapper: {
    alignSelf: "stretch",
  },
  reportIssueButton: {
    borderRadius: 12,
    borderColor: "#212c3d",
    borderWidth: 1,
    borderStyle: "solid",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "stretch",
    backgroundColor: "transparent",
  },
  reportIssueButtonText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    color: "#212c3d",
    textAlign: "center",
    lineHeight: 18,
  },
  // Disabled styles
  reportIssueButtonDisabled: {
    borderColor: "#D3D5D8",
    backgroundColor: "transparent",
  },
  reportIssueButtonTextDisabled: {
    color: "#D3D5D8",
  },
});
