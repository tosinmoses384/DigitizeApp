import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Platform,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { fontSz } from "../../constants";
import AppTabWrapper from "@components/AppTabWrapper";
import { useI18n } from "@hooks/use-i18n";

const { width } = Dimensions.get("window");

const Feedback = () => {
  const { t } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const maxCharacters = 100;

  const handlePress = () => {
    setModalVisible(true);
  };

  // const handleSubmit = () => {
  //   ("Feedback submitted:", feedback);
  //   setFeedback("");
  //   setModalVisible(false);
  // };

  // const handleChangeFeedback = (text) => {
  //   if (text.length <= maxCharacters) {
  //     setFeedback(text);
  //   }
  // };

  return (
    <AppTabWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 20,
        }}
      >
        <StackHeader title={t('feedback.sendYourFeedback')} onPress={() => router.back()} />

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text
            style={{
              fontSize: fontSz(20),
              fontFamily: "DMSansBold",
              marginVertical: 10,
            }}
          >
            {t('feedback.sendUsFeedback')}
          </Text>
          <Text style={{ marginVertical: 10 }}>
            {t('feedback.feedbackDescription')}
          </Text>
          <Text style={{ marginVertical: 10 }}>
            {t('feedback.feedbackNote')}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/FeedbackForm")}
            style={{
              borderRadius: 12,
              backgroundColor: "#FF3B4A",
              width: width / 2,
              alignItems: "center",
              padding: 10,
              marginTop: 20,
            }}
          >
            <Text style={{ color: "white", fontFamily: "DMSansMedium" }}>
              {t('feedback.fillInForm')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </AppTabWrapper>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: width * 0.8,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: fontSz(18),
    fontFamily: "DMSansBold",
    marginBottom: 10,
  },
  input: {
    height: 100,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  characterCount: {
    alignSelf: "flex-end",
    marginBottom: 10,
    fontSize: fontSz(14),
  },
  submitButton: {
    backgroundColor: "#FF3B4A",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontFamily: "DMSansMedium",
  },
  closeButton: {
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FF3B4A",
    fontFamily: "DMSansMedium",
  },
});

export default Feedback;
