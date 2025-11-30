import CustomButton from "@components/CustomButton";
import { formatAmount } from "@helper/formatCash";
import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityComponentProps } from "../types";
import ReportIssueModal from "@modals/ReportIssueModal";
import LeaveReviewModal from "@modals/LeaveReviewModal";

const LeaveReviewActivity = ({
  message,
  profileId,
}: ActivityComponentProps) => {
  const metadata = message?.metadata;
  const disabled = metadata?.is_active === "False";
  const deadlineDate = metadata?.deadlineDate;
  const deadlineTime = metadata?.deadlineTime;
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleCloseReportModal = () => {
    setShowReportModal(false);
  };

  const handleOpenReportModal = () => {
    setShowReportModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
  };

  const handleOpenReviewModal = () => {
    setShowReviewModal(true);
  };

  return (
    <View
      style={[
        styles.messageContainer,
        message?.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.title}>Your purchase is complete</Text>
      <View style={styles.descriptionWrapper}>
        <Text style={styles.description}>
          Thank you for buying on DigitizeApp. You have until {deadlineDate} at {deadlineTime} to report an issue. After that, refunds will no longer be available. How was your experience?
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        {disabled ? (
          <View style={[styles.leaveReviewButton, styles.leaveReviewButtonDisabled]}>
            <Text style={[styles.leaveReviewButtonText, styles.leaveReviewButtonTextDisabled]}>
              Leave a Review
            </Text>
          </View>
        ) : (
            <CustomButton
              title="Leave a Review"
              buttonStyle={styles.leaveReviewButton}
              textStyle={styles.leaveReviewButtonText}
              onPress={handleOpenReviewModal}
            />
        )}
        
        {disabled ? (
          <View style={[styles.reportIssueButton, styles.reportIssueButtonDisabled]}>
            <Text style={[styles.reportIssueButtonText, styles.reportIssueButtonTextDisabled]}>
              Report an issue
            </Text>
          </View>
        ) : (
          <CustomButton
            title="Report an issue"
            buttonStyle={styles.reportIssueButton}
            textStyle={styles.reportIssueButtonText}
            onPress={handleOpenReportModal}
          />
        )}
      </View>
      
      <ReportIssueModal
        isVisible={showReportModal}
        onClose={handleCloseReportModal}
        orderId={metadata?.order_id || ""}
        requestId={metadata?.request_id || ""}
      />
      
      <LeaveReviewModal
        isVisible={showReviewModal}
        onClose={handleCloseReviewModal}
        orderId={metadata?.order_id || ""}
        requestId={metadata?.request_id || ""}
        trifterId={metadata?.reviewee_id || ""}
        sellerName={metadata?.reviewee}
        metaData={{
          product_image_url: metadata?.product_image,
          product_name: metadata?.order_description,
          product_amount: metadata?.order_amount,
          product_currency_symbol: metadata?.order_currency_symbol,
        }}
      />
    </View>
  );
};

export default LeaveReviewActivity;

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
  title: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "DMSans-Bold",
    color: "#07090c",
    textAlign: "left",
    alignSelf: "stretch",
  },
  descriptionWrapper: {
    flexDirection: "row",
    alignSelf: "stretch",
  },
  description: {
    fontFamily: "DMSans-Regular",
    color: "#464f5d",
    fontSize: 14,
    textAlign: "left",
    flex: 1,
    lineHeight: 20,
  },
  buttonsContainer: {
    gap: 12,
    alignSelf: "stretch",
  },
  leaveReviewButton: {
    backgroundColor: "#212c3d",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 12,
    alignSelf: "stretch",
  },
  leaveReviewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },
  reportIssueButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 12,
    alignSelf: "stretch",
  },
  reportIssueButtonText: {
    color: "#ff3b4a",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },
  // Disabled styles
  leaveReviewButtonDisabled: {
    backgroundColor: "#D3D5D8",
  },
  leaveReviewButtonTextDisabled: {
    color: "#FF9DA4",
  },
  reportIssueButtonDisabled: {
    backgroundColor: "transparent",
  },
  reportIssueButtonTextDisabled: {
    color: "#D3D5D8",
  },
});
