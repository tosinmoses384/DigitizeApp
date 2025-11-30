import CustomButton from "@components/CustomButton";
import StackHeader from "@components/StackHeader";
import { Colors, SIZES } from "@constants/Colors";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View, RefreshControl } from "react-native";
import TitleAndChevronRight from "@components/TitleAndChevronRight";
import WithdrawalDetailsSkeleton from "@components/WithdrawalDetailsSkeleton";
import { useI18n } from "@hooks/use-i18n";
import { usePayoutAccounts } from "@hooks/use-payout-accounts";
import { useFocusEffect } from "@react-navigation/native";

const PaymentDetailsScreen = () => {
  const { t } = useI18n();
  const { accounts, loading, refetch } = usePayoutAccounts();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const hasPayoutAccount = accounts.length > 0;
  const primaryAccount = accounts[0];

  const handleChangeAccount = useCallback(() => {
    router.push("/WithdrawAccount");
  }, []);

  const handleAddCard = useCallback(() => {
    router.push("/PaymentInfo");
  }, []);

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

      <ScrollView
        style={styles.bodyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.addCarddTitlle}>{t('payments.paymentOptions')}</Text>
        <View style={styles.addCardViewView}>
          <TitleAndChevronRight
            title={t('payments.addCard')}
            onPress={handleAddCard}
          />
        </View>

        <Text style={styles.withdrawalCardTitle}>{t('payments.withdrawalDetails')}</Text>


        {loading ? (
          <WithdrawalDetailsSkeleton />
        ) : hasPayoutAccount ? (
         <>
         <View style={styles.withdrawalCard}>
            
            <View style={styles.accountInfoContainer}>
              <Text style={styles.accountNameText}>{primaryAccount.accountName}</Text>
              <Text style={styles.accountNumberText}>
                {primaryAccount.accountNumber} - {primaryAccount.institutionName}
              </Text>
            </View>
          </View>
          <Text style={styles.supportMessageText}>
              {t('payments.withdrawalChangeMessage')}
            </Text>
          </>
        ) : (
          <View style={styles.addCardViewView}>
            <TitleAndChevronRight
              title={t('payments.addBankAccount')}
              onPress={handleChangeAccount}
          />
        </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PaymentDetailsScreen;

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
  accountName: {
    fontSize: 10,
    color: "#6B727E",
    fontFamily: "DMSansRegular",
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
  withdrawalCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  withdrawalCardTitle: {
    fontSize: 16,
    color: "#071827",
    fontFamily: "DMSansSemiBold",
    marginBottom: 16,
  },
  accountInfoContainer: {
    marginBottom: 16,
  },
  accountNameText: {
    fontSize: 16,
    color: "#071827",
    fontFamily: "DMSansMedium",
    marginBottom: 4,
  },
  accountNumberText: {
    fontSize: 14,
    color: "#071827",
    fontFamily: "DMSansRegular",
  },
  supportMessageText: {
    fontSize: 14,
    color: "#5C6F7F",
    fontFamily: "DMSansRegular",
    lineHeight: 20,
  },
});
