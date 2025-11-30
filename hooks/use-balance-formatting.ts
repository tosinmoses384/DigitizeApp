import { useCallback, useMemo } from 'react';
import { IUserWallet } from '@services/walletService';

interface UseBalanceFormattingProps {
  wallet: IUserWallet | undefined;
  currencySymbol: string;
}

export const useBalanceFormatting = ({ wallet, currencySymbol }: UseBalanceFormattingProps) => {
  const formatSymbolAmount = useCallback((amount: number) => {
    const fixed = Number(amount || 0).toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const spacer = currencySymbol.length > 1 ? ' ' : '';
    return `${currencySymbol}${spacer}${withCommas}.${decPart}`;
  }, [currencySymbol]);

  const balanceAmount = useMemo(() => {
    if (!wallet) return 0;
    return wallet.availableBalance ?? wallet.balance ?? 0;
  }, [wallet]);

  const pendingAmount = useMemo(() => {
    return wallet?.escrowPendingBalance ?? 0;
  }, [wallet]);

  const totalBalance = useMemo(() => {
    if (!wallet) return 0;
    const ledger = wallet.ledgerBalance ?? 0;
    if (ledger > 0) return ledger;
    return (wallet.availableBalance ?? wallet.balance ?? 0) + (wallet.escrowPendingBalance ?? 0);
  }, [wallet]);

  const isWalletActive = useMemo(() => !!wallet, [wallet]);

  const isWithdrawDisabled = useMemo(() => {
    return isWalletActive && Number(balanceAmount) <= 0;
  }, [isWalletActive, balanceAmount]);

  return {
    formatSymbolAmount,
    balanceAmount,
    pendingAmount,
    totalBalance,
    isWalletActive,
    isWithdrawDisabled,
  };
};

