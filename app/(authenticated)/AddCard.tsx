import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import TitleAndChevronRight from "@components/TitleAndChevronRight";
import EmailAndPhoneNumber from "@components/EmailAndPhonenumber";
import { useI18n } from "@hooks/use-i18n";

const AddCard = () => {
  const { t } = useI18n();
  return (
    <View style={styles.wrapper}>
      <View style={{ position: "relative" }}>
        <StackHeader
          title={t('payments.payments')}
          onPress={() => router.push("/settings")}
          isShowHeaderShadow
        />
        <View style={styles.saveButtonView}>
          <CustomButton
            title={t('common.save')}
            textStyle={styles?.saveText}
            buttonStyle={styles?.saveButton}
            onPress={() => {}}
          />
        </View>
      </View>

      <ScrollView style={styles.bodyContainer}>
        <Text style={styles.addCarddTitlle}>{t('payments.paymentOptions')}</Text>
        <View style={styles.addCardViewView}>
          <TitleAndChevronRight title={t('payments.addCard')} />
        </View>
        <Text style={styles.addCarddTitlle}>{t('payments.withdrawalOptions')}</Text>
        <View style={{ marginTop: 16 }}>
          <EmailAndPhoneNumber
            value="Tea Nottee"
            onPress={() => {}}
            actionBtn={
              <CustomButton
                title={t('common.delete')}
                textStyle={styles?.deleteText}
                buttonStyle={styles?.deleteButton}
                onPress={() => {}}
              />
            }
          />
        </View>
        <View style={styles.addCardViewView}>
          <TitleAndChevronRight title={t('payments.changeBankAccount')} />
        </View>
      </ScrollView>
    </View>
  );
};

export default AddCard;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
    paddingBottom: 30,
  },
  saveButtonView: {
    position: "absolute",
    top: 12,
    right: 16,
  },
  bodyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  saveText: {
    color: "#212C3D",
    fontSize: 14,
    fontFamily: "DMSansSemiBold",
  },
  googleText: {
    color: "#6B727E",
    fontSize: 10,
    marginTop: 4,
  },
  addCardViewView: {
    padding: 12,
    backgroundColor: "white",
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  addCarddTitlle: {
    fontSize: 12,
    color: "#071827",
    fontFamily: "DMSansMedium",
  },
  deleteText: {
    color: "#D4313E",
    fontSize: 12,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#AA2731",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
