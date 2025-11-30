import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Platform } from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { fontSz } from "../../constants";
import { Colors, SIZES } from "../../constants/Colors";
import InfoIcon from "../../assets/images/svg/chevron-right-arrow.svg";
import { Ionicons } from "@expo/vector-icons";
import AppTabWrapper from "@components/AppTabWrapper";
import EmptyState from "@components/EmptyState";
import { useI18n } from "@hooks/use-i18n";
import { useWalletBalance } from "@hooks/use-wallet-balance";
import { useTransactionHistory } from "@hooks/use-transaction-history";
import { usePayoutHistory, PayoutHistoryFilters } from "@hooks/use-payout-history";
import { useCurrency } from "@hooks/use-currency";
import { useBalanceFormatting } from "@hooks/use-balance-formatting";
import { usePayoutAccounts } from "@hooks/use-payout-accounts";
import { formatShortDate } from "@utils/date-helper";
import TransactionHistorySkeleton from "@components/TransactionHistorySkeleton";
import { ITransactionHistoryItem, IPayoutHistoryItem } from "@services/walletService";
import PayoutFilterModal from "@modals/PayoutFilterModal";

const Balance = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts'>('transactions');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [payoutFilters, setPayoutFilters] = useState<PayoutHistoryFilters>({});
  
  const { data: wallet, isLoading: isLoadingBalance, refetch: refetchWallet } = useWalletBalance();
  const { accounts, loading: isLoadingAccounts } = usePayoutAccounts();
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    isFetchingNextPage: isFetchingNextPageTransactions,
    hasNextPage: hasNextPageTransactions,
    loadMoreData: loadMoreTransactions,
    refetch: refetchTransactions,
    isRefetching: isRefetchingTransactions,
  } = useTransactionHistory();

  const {
    data: payouts,
    isLoading: isLoadingPayouts,
    isFetchingNextPage: isFetchingNextPagePayouts,
    hasNextPage: hasNextPagePayouts,
    loadMoreData: loadMorePayouts,
    refetch: refetchPayouts,
    isRefetching: isRefetchingPayouts,
  } = usePayoutHistory({ filters: payoutFilters });

  const { currencySymbol } = useCurrency({ wallet });
  const {
    formatSymbolAmount,
    balanceAmount,
    pendingAmount,
    totalBalance,
    isWalletActive,
    isWithdrawDisabled,
  } = useBalanceFormatting({ wallet, currencySymbol });

  const hasPayoutAccounts = useMemo(
    () => accounts.length > 0,
    [accounts]
  );

  const buttonLabel = useMemo(() => {
    if (!isWalletActive) {
      return t('balance.activateBalance');
    }
    return hasPayoutAccounts 
      ? t('balance.withdrawToBankAccount')
      : t('balance.activateBankAccount');
  }, [isWalletActive, hasPayoutAccounts, t]);

  const buttonRoute = useMemo(() => {
    if (!isWalletActive) {
      return "/WithdrawAccount";
    }
    return hasPayoutAccounts ? "/withdrawalDetails" : "/WithdrawAccount";
  }, [isWalletActive, hasPayoutAccounts]);

  const isButtonDisabled = useMemo(() => {
    if (!hasPayoutAccounts) {
      return false;
    }
    return isWithdrawDisabled;
  }, [hasPayoutAccounts, isWithdrawDisabled]);

  const handleEndReached = useCallback(() => {
    if (activeTab === 'transactions') {
      if (hasNextPageTransactions && !isFetchingNextPageTransactions && !isLoadingTransactions) {
        loadMoreTransactions();
      }
    } else {
      if (hasNextPagePayouts && !isFetchingNextPagePayouts && !isLoadingPayouts) {
        loadMorePayouts();
      }
    }
  }, [
    activeTab,
    hasNextPageTransactions,
    isFetchingNextPageTransactions,
    isLoadingTransactions,
    loadMoreTransactions,
    hasNextPagePayouts,
    isFetchingNextPagePayouts,
    isLoadingPayouts,
    loadMorePayouts,
  ]);

  const handleRefresh = useCallback(() => {
    if (activeTab === 'transactions') {
      refetchTransactions();
    } else {
      refetchPayouts();
    }
    refetchWallet();
  }, [activeTab, refetchTransactions, refetchPayouts, refetchWallet]);

  const getPayoutStatusInfo = useCallback((status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      '0': { label: 'Pending', color: '#FF9800' },
      'Pending': { label: 'Pending', color: '#FF9800' },
      '1': { label: 'Completed', color: '#4CAF50' },
      'Completed': { label: 'Completed', color: '#4CAF50' },
      'Success': { label: 'Completed', color: '#4CAF50' },
      '2': { label: 'Failed', color: '#F44336' },
      'Failed': { label: 'Failed', color: '#F44336' },
      'Rejected': { label: 'Rejected', color: '#F44336' },
    };

    const statusKey = status.includes('-') ? status.split('-')[0].trim() : status;
    return statusMap[statusKey] || { label: status, color: '#757575' };
  }, []);

  const formatTransactionAmount = useCallback((amount: number, itemCurrencySymbol?: string) => {
    const currency = itemCurrencySymbol || currencySymbol;
    const fixed = Number(Math.abs(amount) || 0).toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const spacer = currency.length > 1 ? ' ' : '';
    return `${currency}${spacer}${withCommas}.${decPart}`;
  }, [currencySymbol]);

  const renderTransactionItem = useCallback(
    ({ item }: { item: ITransactionHistoryItem }) => {
      const isDebit = item.ledgerEntrySide?.includes('Debit') || item.ledgerEntrySide === '1';
      const formattedAmount = formatTransactionAmount(item.amount);
      const formattedDate = formatShortDate(item.transactionDate);

      return (
        <View style={styles.paymentCard}>
          <Text style={styles.soldText}>
            {isDebit ? t('balance.debit') : t('balance.credit')}
          </Text>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentDetails}>
              <Text style={styles.transactionDescription} numberOfLines={1}>
                {item.descrption || item.transactionReference}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.transactionDate}>{formattedDate}</Text>
            </View>
            <View style={styles.amountSection}>
              <Text
                style={[
                  styles.amountText,
                  isDebit && styles.debitAmount,
                ]}
              >
                {isDebit ? '-' : '+'}{formattedAmount}
              </Text>
              <InfoIcon />
            </View>
          </View>
        </View>
      );
    },
    [currencySymbol, formatTransactionAmount, t]
  );

  const handlePayoutPress = useCallback((item: IPayoutHistoryItem) => {
    router.push({
      pathname: "/payoutDetails",
      params: {
        data: JSON.stringify(item),
      },
    });
  }, []);

  const formatPayoutAmount = useCallback((amount: number, itemCurrencySymbol?: string) => {
    const currency = itemCurrencySymbol || currencySymbol;
    const fixed = Number(amount || 0).toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const spacer = currency.length > 1 ? ' ' : '';
    return `${currency}${spacer}${withCommas}.${decPart}`;
  }, [currencySymbol]);

  const renderPayoutItem = useCallback(
    ({ item }: { item: IPayoutHistoryItem }) => {
      const itemCurrency = item.currencySymbol || currencySymbol;
      const formattedAmount = formatPayoutAmount(item.amount, itemCurrency);
      const formattedDate = formatShortDate(item.createdOn);
      const statusInfo = getPayoutStatusInfo(item.status);

      return (
        <TouchableOpacity
          style={styles.paymentCard}
          onPress={() => handlePayoutPress(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${t('balance.withdrawal')} of ${formattedAmount}, status ${statusInfo.label}`}
        >
          <View style={styles.payoutHeader}>
            <Text style={styles.soldText}>{t('balance.withdrawal')}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
          <View style={styles.paymentInfo}>
            <View style={styles.paymentDetails}>
              <Text style={styles.transactionDescription} numberOfLines={1}>
                {item.narration || item.transactionReference}
              </Text>
              <View style={styles.dot} />
              <Text style={styles.transactionDate}>{formattedDate}</Text>
            </View>
            <View style={styles.amountSection}>
              <Text style={[styles.amountText, styles.debitAmount]}>
                -{formattedAmount}
              </Text>
              <InfoIcon />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [currencySymbol, formatPayoutAmount, getPayoutStatusInfo, handlePayoutPress, t]
  );

  const renderListFooter = useCallback(() => {
    const isFetching = activeTab === 'transactions' 
      ? isFetchingNextPageTransactions 
      : isFetchingNextPagePayouts;

    if (isFetching) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={Colors.light.primaryBase} />
        </View>
      );
    }
    return null;
  }, [activeTab, isFetchingNextPageTransactions, isFetchingNextPagePayouts]);

  const renderListEmpty = useCallback(() => {
    const isLoading = activeTab === 'transactions' 
      ? isLoadingTransactions 
      : isLoadingPayouts;

    if (isLoading) {
      return <TransactionHistorySkeleton count={3} />;
    }

    return (
      <EmptyState
        title={activeTab === 'transactions' 
          ? t('balance.noTransactionHistory')
          : t('balance.noWithdrawalHistory')
        }
        subtitle={t('balance.whenYouDoHistory')}
      />
    );
  }, [activeTab, isLoadingTransactions, isLoadingPayouts, t]);

  const keyExtractor = useCallback(
    (item: ITransactionHistoryItem | IPayoutHistoryItem) => item.id,
    []
  );

  const transactionsSafe = useMemo(
    () => (Array.isArray(transactions) ? transactions : []),
    [transactions]
  );

  const payoutsSafe = useMemo(
    () => (Array.isArray(payouts) ? payouts : []),
    [payouts]
  );

  const statusCounts = useMemo(() => {
    if (!Array.isArray(payouts)) {
      return {
        all: 0,
        pending: 0,
        paid: 0,
        cancelled: 0,
      };
    }

    return {
      all: payouts.length,
      pending: payouts.filter((p: IPayoutHistoryItem) => 
        p.status === "Pending" || p.status === "0"
      ).length,
      paid: payouts.filter((p: IPayoutHistoryItem) => 
        p.status === "Paid" || p.status === "1" || p.status.toLowerCase().includes("success")
      ).length,
      cancelled: payouts.filter((p: IPayoutHistoryItem) => 
        p.status === "Cancelled" || p.status === "2" || p.status.toLowerCase().includes("failed")
      ).length,
    };
  }, [payouts]);

  const currentData = useMemo(() => {
    return activeTab === 'transactions' ? transactionsSafe : payoutsSafe;
  }, [activeTab, transactionsSafe, payoutsSafe]);

  const currentRenderItem = useMemo(() => {
    return activeTab === 'transactions' ? renderTransactionItem : renderPayoutItem;
  }, [activeTab, renderTransactionItem, renderPayoutItem]);

  const isRefreshing = useMemo(() => {
    return activeTab === 'transactions' ? isRefetchingTransactions : isRefetchingPayouts;
  }, [activeTab, isRefetchingTransactions, isRefetchingPayouts]);

  const hasNextPage = useMemo(() => {
    return activeTab === 'transactions' ? hasNextPageTransactions : hasNextPagePayouts;
  }, [activeTab, hasNextPageTransactions, hasNextPagePayouts]);

  useFocusEffect(
    useCallback(() => {
      refetchWallet();
      refetchTransactions();
      refetchPayouts();
    }, [refetchWallet, refetchTransactions, refetchPayouts])
  );

  const handleTabPress = useCallback((tab: 'transactions' | 'payouts') => {
    setActiveTab(tab);
    if (tab === 'transactions') {
      refetchTransactions();
    } else {
      refetchPayouts();
    }
  }, [refetchTransactions, refetchPayouts]);

  const handleOpenFilter = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleCloseFilter = useCallback(() => {
    setShowFilterModal(false);
  }, []);

  const handleApplyFilters = useCallback((filters: PayoutHistoryFilters) => {
    setPayoutFilters(filters);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      payoutFilters.requestStatus ||
      payoutFilters.startDate ||
      payoutFilters.endDate
    );
  }, [payoutFilters]);

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
        <StackHeader title={t('balance.balance')} onPress={() => router.push("/profile")} />
        
        <FlatList
          data={currentData}
          renderItem={currentRenderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={
            <View>
              <View style={styles.availableBalanceContainer}>
                {/* Pending balance pill */}
                <View style={styles.pendingPill} accessible accessibilityLabel={`${t('balance.pendingBalance')} ${formatSymbolAmount(pendingAmount)}`}>
                  <View style={styles.pendingPillLeft}>
                    <Text style={styles.pendingPillText}>{t('balance.pendingBalance')}</Text>
                    <Ionicons name="information-circle-outline" size={14} color={Colors.light.walletTextLight} style={styles.infoIcon} />
                  </View>
                  <Text
                    style={styles.pendingPillAmount}
                    numberOfLines={1}
                    ellipsizeMode="clip"
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                  >
                    {formatSymbolAmount(pendingAmount)}
                  </Text>
                </View>

                {/* Available balance title and amount */}
                <View style={styles.balanceHeader}>
                  <View
                    style={styles.availableLabelRow}
                    accessible
                    accessibilityLabel={`${t('balance.availableBalance')} ${isLoadingBalance ? '' : formatSymbolAmount(balanceAmount)}`}
                  >
                    <Text style={styles.availableBalanceText}>
                      {t('balance.availableBalance')}
                    </Text>
                    <Ionicons name="information-circle-outline" size={14} color={Colors.light.walletTextLight} style={styles.infoIcon} />
                  </View>
                  {isLoadingBalance ? (
                    <View style={styles.balanceSkeleton}>
                      <ActivityIndicator size="small" color={Colors.light.walletAccentLight} />
                    </View>
                  ) : (
                    <Text
                      style={styles.balanceAmountLarge}
                      numberOfLines={1}
                      ellipsizeMode="clip"
                      adjustsFontSizeToFit
                      minimumFontScale={0.6}
                    >
                      {formatSymbolAmount(balanceAmount)}
                    </Text>
                  )}
                </View>

                {/* Total balance row */}
                {!isLoadingBalance && (
                  <View style={styles.totalRow} accessible accessibilityLabel={`${t('balance.totalBalance')} ${formatSymbolAmount(totalBalance)}`}>
                    <View style={styles.totalRowInline}>
                      <View style={styles.totalRowLeft}>
                        <Text style={styles.totalLabel}>{t('balance.totalBalance')}</Text>
                        <Ionicons name="information-circle-outline" size={14} color={Colors.light.walletTextLight} style={styles.infoIcon} />
                      </View>
                      <Text
                        style={styles.totalAmount}
                        numberOfLines={1}
                        ellipsizeMode="clip"
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
                        {formatSymbolAmount(totalBalance)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Withdraw button */}
                {!isLoadingBalance && !isLoadingAccounts && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.withdrawButton, isButtonDisabled && styles.withdrawButtonDisabled]}
                    onPress={() => router.push(buttonRoute)}
                    disabled={isButtonDisabled}
                    accessibilityRole="button"
                    accessibilityLabel={buttonLabel}
                    accessibilityState={{ disabled: isButtonDisabled }}
                  >
                    <Text style={[styles.withdrawText, isButtonDisabled && styles.withdrawTextDisabled]}>
                      {buttonLabel}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {(isLoadingBalance || isLoadingAccounts) && (
                  <View style={styles.withdrawButton}>
                    <ActivityIndicator size="small" color={Colors.light.walletButtonText} />
                  </View>
                )}
              </View>

              <View style={styles.paymentHistoryContainer}>
                <View style={styles.paymentHistoryHeader}>
                  <Text style={styles.paymentHistoryTitle}>
                    {t('balance.paymentHistory')}
                  </Text>
                  {activeTab === 'payouts' && (
                    <TouchableOpacity
                      onPress={handleOpenFilter}
                      style={styles.filterButton}
                      accessibilityRole="button"
                      accessibilityLabel={t('balance.withdrawals')}
                    >
                      <Ionicons
                        name="filter"
                        size={20}
                        color={hasActiveFilters ? Colors.light.primaryBase : "#5C6F7F"}
                      />
                      {hasActiveFilters && <View style={styles.filterDot} />}
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === 'transactions' && styles.activeTab,
                    ]}
                    onPress={() => handleTabPress('transactions')}
                    accessibilityRole="button"
                    accessibilityLabel={t('balance.payments')}
                    accessibilityState={{ selected: activeTab === 'transactions' }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'transactions' && styles.activeTabText,
                      ]}
                    >
                      {t('balance.payments')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === 'payouts' && styles.activeTab,
                    ]}
                    onPress={() => handleTabPress('payouts')}
                    accessibilityRole="button"
                    accessibilityLabel={t('balance.withdrawals')}
                    accessibilityState={{ selected: activeTab === 'payouts' }}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'payouts' && styles.activeTabText,
                      ]}
                    >
                      {t('balance.withdrawals')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={renderListEmpty}
          ListFooterComponent={renderListFooter}
          onEndReached={hasNextPage ? handleEndReached : undefined}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.primaryBase}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <PayoutFilterModal
          isVisible={showFilterModal}
          onClose={handleCloseFilter}
          onApplyFilters={handleApplyFilters}
          currentFilters={payoutFilters}
          totalCount={payoutsSafe.length}
          statusCounts={statusCounts}
        />
      </View>
    </AppTabWrapper>
  );
};

export default Balance;

const styles = StyleSheet.create({
  balanceContainer: {
    backgroundColor: "#FFF7F8",
    flexDirection: "row",
    justifyContent: "space-between",
    height: 52,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radius2,
    borderColor: "#FFD8DB",
    borderWidth: 2,
  },
  pendingBalance: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pendingText: {
    fontFamily: "DMSansRegular",
  },
  balanceAmount: {
    color: "#1C2533",
    fontFamily: "DMSansBold",
    textAlign: "right",
  },
  availableBalanceContainer: {
    backgroundColor: Colors.light.walletCardBg,
    justifyContent: "space-between",
    minHeight: 240,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 28,
    marginTop: 15,
  },
  pendingPill: {
    alignSelf: "center",
    width: "88%",
    backgroundColor: Colors.light.walletPillBg,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingPillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  pendingPillText: {
    color: Colors.light.walletTextLight,
    fontFamily: "DMSansRegular",
    fontSize: fontSz(12),
    textTransform: "capitalize",
  },
  pendingPillAmount: {
    color: Colors.light.walletTextLight,
    fontFamily: "DMSansBold",
    fontSize: fontSz(14),
    textAlign: "right",
    maxWidth: "55%",
  },
  balanceHeader: {
    alignItems: "center",
    gap: 8,
  },
  availableLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  availableBalanceText: {
    fontFamily: "DMSansRegular",
    color: Colors.light.walletTextLight,
    marginTop: 8,
  },
  balanceAmountLarge: {
    color: Colors.light.walletHeroText,
    fontFamily: "DMSansBold",
    fontSize: fontSz(46),
    textAlign: "center",
  },
  totalRow: {
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  totalRowInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "92%",
  },
  totalRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  totalLabel: {
    color: Colors.light.walletTextLight,
    fontFamily: "DMSansRegular",
    fontSize: fontSz(12),
  },
  totalAmount: {
    color: Colors.light.walletHeroText,
    fontFamily: "DMSansMedium",
    fontSize: fontSz(13),
    textAlign: "left",
    maxWidth: "45%",
  },
  withdrawButton: {
    backgroundColor: Colors.light.walletButtonBg,
    flexDirection: "row",
    justifyContent: "center",
    height: 54,
    alignItems: "center",
    alignSelf: "stretch",
    paddingHorizontal: 16,
    borderRadius: 28,
    marginTop: 16,
    marginBottom: 18,
  },
  withdrawButtonDisabled: {
    backgroundColor: Colors.light.walletButtonBgDisabled,
  },
  withdrawText: {
    fontFamily: "DMSansMedium",
    color: Colors.light.walletButtonText,
    fontSize: fontSz(16),
  },
  withdrawTextDisabled: {
    color: Colors.light.walletButtonTextDisabled,
  },
  infoIcon: {
    marginTop: 1,
  },
  paymentHistoryContainer: {
    marginTop: 14,
  },
  paymentHistoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  paymentHistoryTitle: {
    fontFamily: "DMSansBold",
    color: "#071827",
    fontSize: fontSz(14),
  },
  viewAllText: {
    fontFamily: "DMSansRegular",
    color: "#5C6F7F",
    fontSize: fontSz(12),
  },
  paymentCard: {
    borderColor: "#E9EAEB",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    height: 70,
    marginBottom: 10,
    justifyContent: "center",
  },
  soldText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(12),
    color: "#071827",
    marginBottom: 6,
  },
  paymentInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentDetails: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  transactionDescription: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    color: "#071827",
    flexShrink: 1,
  },
  transactionDate: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(12),
    color: "#5C6F7F",
  },
  dot: {
    height: 5,
    width: 5,
    backgroundColor: "#898989",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  amountSection: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 5,
  },
  amountText: {
    fontFamily: "DMSansBold",
    textAlign: "right",
    fontSize: fontSz(14),
    color: "#071827",
  },
  debitAmount: {
    color: "#AA2731",
  },
  balanceSkeleton: {
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyIncomeContainer: {
    alignItems: "center",
    marginTop: 10,
    borderColor: "#E9EAEB",
    borderWidth: 1,
    borderRadius: 8,
    padding: 30,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyIncomeText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(16),
    marginTop: 10,
    textAlign: "center",
  },
  emptyIncomeSubText: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(10),
    color: "#5C6F7F",
    textAlign: "center",
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 4,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: Colors.light.background,
  },
  tabText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(14),
    color: "#5C6F7F",
  },
  activeTabText: {
    color: Colors.light.primaryBase,
    fontFamily: "DMSansBold",
  },
  payoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(11),
  },
  filterButton: {
    position: "relative",
    padding: 8,
  },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primaryBase,
  },
});
