import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Platform,
  ActivityIndicator,
  TextInput,
} from "react-native";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { defaultStyles } from "../../constants/Styles";
import StackHeader from "../../components/StackHeader";
import { router } from "expo-router";
import { Colors, SIZES } from "../../constants/Colors";
import TextButton from "../../components/buttons/Text_button";
import FilledButton from "../../components/buttons/Filled_button";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { fontSz } from "../../constants";
import { usePayoutAccounts } from "@hooks/use-payout-accounts";
import { useWalletBalance } from "@hooks/use-wallet-balance";
import { useWithdrawalRequest } from "@hooks/use-withdrawal-request";
import { useToast } from "react-native-toast-notifications";
import { useAppSelector } from "@redux/store";
import walletService from "@services/walletService";
import { useI18n } from "@hooks/use-i18n";

const WithdrawalDetails = () => {
  const { t } = useI18n();
  const toast = useToast();
  const { token } = useAppSelector((state) => state.userProfileSlice);
  const { accounts, loading: loadingAccounts, refetch: refetchAccounts } = usePayoutAccounts();
  const { data: wallet } = useWalletBalance();
  const { isLoading: isWithdrawing, requestWithdrawal } = useWithdrawalRequest();

  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isAmountValid, setIsAmountValid] = useState(false);

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const activeAccount = useMemo(() => {
    return accounts.find((acc) => acc.status === "Active");
  }, [accounts]);

  useEffect(() => {
    if (activeAccount) {
      setBankName(activeAccount.institutionName);
      setAccountNumber(activeAccount.accountNumber);
      setAccountName(activeAccount.accountName);
    }
  }, [activeAccount]);

  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

  const validateAmount = useCallback((value: string): boolean => {
    const numValue = parseFloat(value);
    
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, amount: "Amount is required" }));
      setIsAmountValid(false);
      return false;
    }

    if (isNaN(numValue) || numValue <= 0) {
      setErrors((prev) => ({ ...prev, amount: "Please enter a valid amount" }));
      setIsAmountValid(false);
      return false;
    }

    const availableBalance = wallet?.availableBalance ?? 0;
    if (numValue > availableBalance) {
      const currency = wallet?.currencySymbol || '₦';
      setErrors((prev) => ({ 
        ...prev, 
        amount: `Insufficient balance. Available: ${currency}${formatCurrency(availableBalance)}` 
      }));
      setIsAmountValid(false);
      return false;
    }

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.amount;
      return newErrors;
    });
    setIsAmountValid(true);
    return true;
  }, [wallet, formatCurrency]);

  const handleAmountChange = useCallback((text: string) => {
    const cleanedText = text.replace(/[^0-9.]/g, "");
    const parts = cleanedText.split(".");
    const formattedText = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join("")}` 
      : cleanedText;
    
    setAmount(formattedText);
    setIsAmountValid(false);
    
    if (errors.amount) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.amount;
        return newErrors;
      });
    }
  }, [errors.amount]);

  const handleWithdraw = useCallback(async () => {
    if (!validateAmount(amount)) {
      toast.show("Please enter a valid amount", { type: "warning", duration: 3000 });
      return;
    }

    if (!wallet?.walletId) {
      toast.show("Wallet information not available", { type: "danger", duration: 3000 });
      return;
    }

    if (!activeAccount) {
      toast.show("No active withdrawal account found", { type: "danger", duration: 3000 });
      return;
    }

    const numAmount = parseFloat(amount);
    const finalNarration = narration.trim() || undefined;

    const success = await requestWithdrawal(numAmount, wallet.walletId, finalNarration);

    if (success) {
      toast.show("Withdrawal request submitted successfully", { 
        type: "success", 
        duration: 3000 
      });
      router.back();
    } else {
      toast.show("Failed to process withdrawal. Please try again.", { 
        type: "danger", 
        duration: 3000 
      });
    }
  }, [amount, narration, wallet, activeAccount, validateAmount, requestWithdrawal, toast]);

  const toggleModal = useCallback(() => {
    setIsModalVisible((prev) => !prev);
  }, []);

  const saveAccountDetails = useCallback(async () => {
    if (!bankName || !accountNumber || !accountName || accountNumber.length !== 10) {
      toast.show("Please fill in all account details correctly", { 
        type: "warning", 
        duration: 3000 
      });
      return;
    }

    if (!token) {
      toast.show("Authentication token not available", { type: "danger", duration: 3000 });
      return;
    }

    try {
      setIsSavingAccount(true);

      const accountData = {
        institutionName: bankName,
        accountNumber,
        accountName,
      };

      const response = await walletService.createPayoutAccount(token, accountData);

      if (response?.status === 200 || response?.status === 201) {
        toast.show("Account saved successfully", { type: "success", duration: 3000 });
        toggleModal();
        refetchAccounts();
      } else {
        const errorMessage = (response as any)?.message || "Failed to save account";
        toast.show(errorMessage, { type: "danger", duration: 3000 });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save account";
      toast.show(errorMessage, { type: "danger", duration: 3000 });
    } finally {
      setIsSavingAccount(false);
    }
  }, [bankName, accountNumber, accountName, token, toast, toggleModal, refetchAccounts]);

  const maskAccountNumber = useCallback((number: string): string => {
    if (number.length <= 5) {
      return "•".repeat(number.length);
    }
    return "•".repeat(5) + number.slice(5);
  }, []);

  const banks = useMemo(() => [
    { label: "JPMorgan Chase", value: "JPMorgan Chase" },
    { label: "Bank of America", value: "Bank of America" },
    { label: "Wells Fargo", value: "Wells Fargo" },
    { label: "Citibank", value: "Citibank" },
    { label: "HSBC", value: "HSBC" },
    { label: "Barclays", value: "Barclays" },
    { label: "Goldman Sachs", value: "Goldman Sachs" },
    { label: "Deutsche Bank", value: "Deutsche Bank" },
    { label: "Credit Suisse", value: "Credit Suisse" },
    { label: "BNP Paribas", value: "BNP Paribas" },
    { label: "UBS", value: "UBS" },
    { label: "Royal Bank of Canada", value: "Royal Bank of Canada" },
    { label: "Santander", value: "Santander" },
    { label: "Standard Chartered", value: "Standard Chartered" },
    { label: "Access Bank", value: "Access Bank" },
    { label: "Zenith Bank", value: "Zenith Bank" },
    { label: "Guaranty Trust Bank (GTBank)", value: "Guaranty Trust Bank" },
    { label: "First Bank of Nigeria", value: "First Bank of Nigeria" },
    { label: "United Bank for Africa (UBA)", value: "United Bank for Africa" },
    { label: "Union Bank", value: "Union Bank" },
    { label: "Sterling Bank", value: "Sterling Bank" },
    { label: "Fidelity Bank", value: "Fidelity Bank" },
    { label: "Ecobank", value: "Ecobank" },
    { label: "Polaris Bank", value: "Polaris Bank" },
    { label: "Wema Bank", value: "Wema Bank" },
    { label: "Keystone Bank", value: "Keystone Bank" },
  ], []);

  const isWithdrawDisabled = useMemo(() => {
    return !amount.trim() || isWithdrawing || loadingAccounts || !activeAccount;
  }, [amount, isWithdrawing, loadingAccounts, activeAccount]);

  const disabledButtonMessage = useMemo(() => {
    if (!activeAccount) return "Add a withdrawal account to continue";
    if (!amount.trim()) return "Enter amount to continue";
    if (loadingAccounts) return "Loading account details...";
    return "";
  }, [activeAccount, amount, loadingAccounts]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.light.background,
        paddingTop: Platform.OS === "ios" ? SIZES.height / 22 : SIZES.padding,
        paddingHorizontal: 20,
      }}
    >
      <StackHeader
        title="Withdraw to bank account"
        onPress={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={defaultStyles.header}>Withdrawal Details</Text>

        {wallet && (
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {wallet.currencySymbol || '₦'}{formatCurrency(wallet.availableBalance ?? 0)}
            </Text>
          </View>
        )}

        <Text style={[defaultStyles.descriptionText, { marginTop: 16 }]}>
          Enter amount you want to withdraw
        </Text>

        <View
          style={[
            styles.inputContainer,
            errors.amount ? styles.errorBorder : {},
            isAmountValid && !errors.amount ? styles.successBorder : {},
          ]}
        >
          <Text
            style={[
              styles.placeholder,
              focusedField === "amount" || amount
                ? styles.placeholderFocused
                : {},
            ]}
          >
            Enter amount
          </Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder={focusedField === "amount" || amount ? "" : " "}
            placeholderTextColor={Colors.light.disabled}
            value={amount}
            onBlur={() => {
              setFocusedField(null);
              validateAmount(amount);
            }}
            onFocus={() => setFocusedField("amount")}
            onChangeText={handleAmountChange}
            selectionColor={"#6b6464"}
            keyboardType="decimal-pad"
            accessibilityLabel="Enter withdrawal amount"
            accessibilityRole="none"
          />
        </View>
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        {isAmountValid && !errors.amount && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.successText}>Valid amount entered</Text>
          </View>
        )}

        <Text style={[defaultStyles.descriptionText, { marginTop: 16 }]}>
          {t('balance.narrationDescription')}
        </Text>

        <View
          style={[
            styles.textAreaContainer,
            focusedField === "narration" && styles.textAreaFocused,
          ]}
        >
          <Text
            style={[
              styles.placeholder,
              focusedField === "narration" || narration
                ? styles.placeholderFocused
                : {},
            ]}
          >
            {t('balance.narrationLabel')}
          </Text>
          <TextInput
            style={[styles.textArea]}
            placeholder={focusedField === "narration" || narration ? "" : " "}
            placeholderTextColor={Colors.light.disabled}
            value={narration}
            onBlur={() => setFocusedField(null)}
            onFocus={() => setFocusedField("narration")}
            onChangeText={setNarration}
            selectionColor={"#6b6464"}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={200}
            accessibilityLabel={t('balance.narrationPlaceholder')}
            accessibilityRole="none"
          />
          <Text style={styles.characterCount}>
            {narration.length}/200
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Withdrawal Account</Text>
        
        {loadingAccounts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.light.primaryBase} />
            <Text style={styles.loadingText}>Loading account details...</Text>
          </View>
        ) : activeAccount ? (
          <View style={styles.accountCard}>
            <View style={styles.accountCardHeader}>
              <View style={styles.bankIconContainer}>
                <Ionicons name="card-outline" size={24} color={Colors.light.primaryBase} />
              </View>
              <View style={styles.accountCardContent}>
                <Text style={styles.bankNameText}>{activeAccount.institutionName}</Text>
                <Text style={styles.accountNameText}>{activeAccount.accountName}</Text>
                <Text style={styles.accountNumberText}>
                  {maskAccountNumber(activeAccount.accountNumber)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.noAccountCard}
            onPress={toggleModal}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Tap to add withdrawal account"
          >
            <Ionicons name="add-circle-outline" size={32} color="#AA2731" />
            <Text style={styles.noAccountText}>
              No withdrawal account found
            </Text>
            <Text style={styles.noAccountSubText}>
              Tap here to add a bank account
            </Text>
          </TouchableOpacity>
        )}

        {isWithdrawDisabled && disabledButtonMessage && (
          <Text style={styles.helperText}>{disabledButtonMessage}</Text>
        )}

        <View style={{ paddingVertical: 10 }}>
          <FilledButton
            title={"Withdraw"}
            onPress={handleWithdraw}
            disable={isWithdrawDisabled}
            loading={isWithdrawing}
          />
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={defaultStyles.header}>Withdrawal Account</Text>
            <Text>
              Please provide the account details for easy funds withdrawal from
              your wallet
            </Text>

            <View
              style={[
                styles.inputContainer,
                errors.bankName ? styles.errorBorder : {},
              ]}
            >
              <Text
                style={[
                  styles.placeholder,
                  focusedField === "banks" || bankName
                    ? styles.placeholderFocused
                    : {},
                ]}
              >
                Select Bank
              </Text>
              <View style={styles.pickerWrapper}>
                <RNPickerSelect
                  onValueChange={(value) => setBankName(value)}
                  items={banks}
                  style={{
                    ...pickerSelectStyles,
                    iconContainer: {
                      top: 10,
                      right: 10,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  }}
                  value={bankName}
                  Icon={() => (
                    <FontAwesome name="chevron-down" size={20} color="gray" />
                  )}
                />
              </View>
            </View>

            <View
              style={[
                styles.inputContainer,
                errors.accountNumber ? styles.errorBorder : {},
              ]}
            >
              <Text
                style={[
                  styles.placeholder,
                  focusedField === "accountNumber" || accountNumber
                    ? styles.placeholderFocused
                    : {},
                ]}
              >
                Account Number
              </Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={
                  focusedField === "accountNumber" || accountNumber ? "" : " "
                }
                placeholderTextColor={Colors.light.disabled}
                value={accountNumber}
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("accountNumber")}
                onChangeText={(text) => {
                  if (text.length <= 10) {
                    setAccountNumber(text.replace(/[^0-9]/g, ""));
                  }
                }}
                selectionColor={"#6b6464"}
                keyboardType="numeric"
                accessibilityLabel="Enter account number"
                accessibilityRole="none"
              />
            </View>

            <View
              style={[
                styles.inputContainer,
                errors.accountName ? styles.errorBorder : {},
              ]}
            >
              <Text
                style={[
                  styles.placeholder,
                  focusedField === "accountName" || accountName
                    ? styles.placeholderFocused
                    : {},
                ]}
              >
                Account Name
              </Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={
                  focusedField === "accountName" || accountName ? "" : " "
                }
                placeholderTextColor={Colors.light.disabled}
                value={accountName}
                onBlur={() => setFocusedField(null)}
                onFocus={() => setFocusedField("accountName")}
                onChangeText={(text) => setAccountName(text)}
                selectionColor={"#6b6464"}
                accessibilityLabel="Enter account name"
                accessibilityRole="none"
              />
            </View>

            <View
              style={{
                paddingVertical: 20,
                alignItems: "center",
              }}
            >
              <FilledButton
                title={"Save"}
                onPress={saveAccountDetails}
                disable={
                  !bankName ||
                  accountNumber.length !== 10 ||
                  !accountNumber ||
                  !accountName ||
                  isSavingAccount
                }
                loading={isSavingAccount}
                style={{ width: 330 }}
              />
              <TextButton title={"Cancel"} onPress={toggleModal} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default WithdrawalDetails;

const styles = StyleSheet.create({
  balanceContainer: {
    marginTop: 12,
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D0E5FF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(14),
    color: "#5C6F7F",
  },
  balanceAmount: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(20),
    color: Colors.light.primaryBase,
  },
  inputContainer: {
    marginTop: 8,
    flexDirection: "row",
    backgroundColor: "#919EAB14",
    borderRadius: 12,
  },
  input: {
    padding: 20,
    fontSize: 19,
    marginRight: 10,
    flexDirection: "row",
    fontFamily: "DMSansBold",
    top: 10,
    color: "#212B36",
  },
  successBorder: {
    borderWidth: 1,
    borderColor: "#10B981",
  },
  successContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginLeft: 20,
    gap: 6,
  },
  successText: {
    color: "#10B981",
    fontSize: fontSz(13),
    fontFamily: "DMSansMedium",
  },
  sectionLabel: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(18),
    color: "#212B36",
    marginBottom: 4,
  },
  accountCard: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderColor: "#E0E0E0",
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bankIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  accountCardContent: {
    flex: 1,
    gap: 2,
  },
  bankNameText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(12),
    color: "#9E9E9E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  accountNameText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(16),
    color: "#212B36",
  },
  accountNumberText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(14),
    color: "#5C6F7F",
  },
  noAccountCard: {
    marginTop: 12,
    flexDirection: "column",
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderColor: "#FFCDD2",
    gap: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    backgroundColor: "#FFF7F8",
    alignItems: "center",
  },
  noAccountText: {
    fontFamily: "DMSansBold",
    fontSize: fontSz(16),
    color: "#AA2731",
    marginTop: 4,
  },
  noAccountSubText: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    color: "#5C6F7F",
    textAlign: "center",
  },
  helperText: {
    fontFamily: "DMSansMedium",
    fontSize: fontSz(13),
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 12,
    marginBottom: -4,
  },
  loadingContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontFamily: "DMSansRegular",
    fontSize: fontSz(14),
    color: "#5C6F7F",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  pickerWrapper: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 8,
    paddingVertical: 5,
  },
  placeholder: {
    position: "absolute",
    top: "45%",
    left: 20,
    fontFamily: "DMSansMedium",
    fontSize: 18,
    color: Colors.light.disabled,
    transform: [{ translateY: -7 }],
  },
  placeholderFocused: {
    top: 15,
    fontSize: 16,
    color: Colors.light.tint,
    fontFamily: "DMSansMedium",
  },
  errorBorder: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    fontFamily: "DMSansRegular",
    marginTop: 5,
    marginLeft: 20,
  },
  textAreaContainer: {
    marginTop: 8,
    backgroundColor: "#919EAB14",
    borderRadius: 12,
    minHeight: 100,
    paddingBottom: 10,
    position: "relative",
  },
  textAreaFocused: {
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  textArea: {
    padding: 20,
    fontSize: 16,
    fontFamily: "DMSansRegular",
    paddingTop: 35,
    minHeight: 100,
    color: "#212B36",
  },
  characterCount: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 12,
    fontFamily: "DMSansRegular",
    color: "#9E9E9E",
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 18,
    paddingTop: 18,
    paddingBottom: 5,
    marginTop: 5,
    marginLeft: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    paddingRight: 30,
    fontFamily: "DMSansBold",
  },
  inputAndroid: {
    fontSize: 18,
    paddingTop: 18,
    paddingBottom: 5,
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    paddingRight: 30,
    marginLeft: 10,
    fontFamily: "DMSansBold",
  },
};
