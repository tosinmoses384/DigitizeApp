import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import React, { useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Colors, SIZES } from "../../constants/Colors";
import StackHeader from "../../components/StackHeader";
import { fontSz } from "../../constants";
import { formatShortDate } from "@utils/date-helper";
import { useCurrency } from "@hooks/use-currency";
import { useWalletBalance } from "@hooks/use-wallet-balance";
import { useI18n } from "@hooks/use-i18n";

const PayoutDetails = () => {
  const { t } = useI18n();
  const params = useLocalSearchParams();
  const { data: wallet } = useWalletBalance();
  const { currencySymbol: walletCurrencySymbol } = useCurrency({ wallet });

  const payoutData = useMemo(() => {
    if (!params.data) return null;
    return JSON.parse(params.data as string);
  }, [params.data]);

  const currencySymbol = useMemo(() => {
    return payoutData?.currencySymbol || walletCurrencySymbol;
  }, [payoutData, walletCurrencySymbol]);

  const getStatusInfo = useMemo(() => {
    if (!payoutData) return { label: "", color: "", bgColor: "" };

    const status = payoutData.status;
    const statusMap: Record<
      string,
      { labelKey: string; color: string; bgColor: string }
    > = {
      "0": {
        labelKey: "balance.pending",
        color: "#FF9800",
        bgColor: "#FFF3E0",
      },
      Pending: {
        labelKey: "balance.pending",
        color: "#FF9800",
        bgColor: "#FFF3E0",
      },
      "1": {
        labelKey: "balance.completed",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
      },
      Paid: {
        labelKey: "balance.completed",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
      },
      Completed: {
        labelKey: "balance.completed",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
      },
      Success: {
        labelKey: "balance.completed",
        color: "#4CAF50",
        bgColor: "#E8F5E9",
      },
      "2": {
        labelKey: "balance.cancelled",
        color: "#F44336",
        bgColor: "#FFEBEE",
      },
      Cancelled: {
        labelKey: "balance.cancelled",
        color: "#F44336",
        bgColor: "#FFEBEE",
      },
      Failed: {
        labelKey: "balance.failed",
        color: "#F44336",
        bgColor: "#FFEBEE",
      },
      Rejected: {
        labelKey: "balance.rejected",
        color: "#F44336",
        bgColor: "#FFEBEE",
      },
    };

    const statusKey = status.includes("-")
      ? status.split("-")[0].trim()
      : status;
    const statusInfo = statusMap[statusKey] || {
      labelKey: "",
      color: "#757575",
      bgColor: "#F5F5F5",
    };

    return {
      label: statusInfo.labelKey ? t(statusInfo.labelKey) : status,
      color: statusInfo.color,
      bgColor: statusInfo.bgColor,
    };
  }, [payoutData, t]);

  if (!payoutData) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.light.background,
          paddingTop:
            Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
          paddingHorizontal: 20,
        }}
      >
        <StackHeader title={t('balance.payoutDetails')} onPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primaryBase} />
        </View>
      </View>
    );
  }

  const formattedAmount = `${currencySymbol}${Number(payoutData.amount || 0)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  const formattedDate = formatShortDate(payoutData.createdOn);
  const formattedUpdatedDate = payoutData.updatedAt
    ? formatShortDate(payoutData.updatedAt)
    : "N/A";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        paddingHorizontal: 20,
      }}
    >
      <StackHeader title={t('balance.payoutDetails')} onPress={() => router.back()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>{t('balance.withdrawalAmount')}</Text>
          <Text style={styles.amountValue}>{formattedAmount}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusInfo.bgColor },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusInfo.color }]}>
              {getStatusInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>{t('balance.transactionDetails')}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('balance.transactionReference')}</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {payoutData.transactionReference}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('balance.transactionId')}</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {payoutData.id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('balance.narration')}</Text>
            <Text style={[styles.detailValue, styles.multilineValue]}>
              {payoutData.narration}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('balance.createdOn')}</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>

          {payoutData.updatedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('balance.lastUpdated')}</Text>
              <Text style={styles.detailValue}>{formattedUpdatedDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>{t('balance.accountDetails')}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('balance.accountName')}</Text>
            <Text style={styles.detailValue}>
              {payoutData.senderWalletAccountName}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('balance.accountNumber')}</Text>
            <Text style={styles.detailValue}>
              {payoutData.senderWalletAccountNumber}
            </Text>
          </View>
        </View>

        {getStatusInfo.label === t('balance.pending') && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {t('balance.withdrawalProcessingMessage')}
            </Text>
          </View>
        )}

        {getStatusInfo.label === t('balance.completed') && (
          <View style={[styles.infoBox, styles.successBox]}>
            <Text style={[styles.infoText, styles.successText]}>
              {t('balance.withdrawalSuccessMessage')}
            </Text>
          </View>
        )}

        {(getStatusInfo.label === t('balance.cancelled') ||
          getStatusInfo.label === t('balance.failed') ||
          getStatusInfo.label === t('balance.rejected')) && (
          <View style={[styles.infoBox, styles.errorBox]}>
            <Text style={[styles.infoText, styles.errorText]}>
              {t('balance.withdrawalFailedMessage')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PayoutDetails;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  amountCard: {
    backgroundColor: Colors.light.walletCardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  amountLabel: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    color: Colors.light.walletTextLight,
    marginBottom: 8,
  },
  amountValue: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(36),
    color: Colors.light.walletHeroText,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
  },
  detailsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9EAEB",
  },
  sectionTitle: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(16),
    color: "#071827",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  detailLabel: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    color: "#5C6F7F",
    flex: 1,
  },
  detailValue: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(14),
    color: "#071827",
    flex: 1,
    textAlign: "right",
  },
  multilineValue: {
    textAlign: "right",
  },
  infoBox: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  successBox: {
    backgroundColor: "#E8F5E9",
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
  },
  infoText: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(13),
    color: "#FF9800",
    lineHeight: 20,
  },
  successText: {
    color: "#4CAF50",
  },
  errorText: {
    color: "#F44336",
  },
});

