import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@redux/store';
import walletService, { IPayoutAccount } from '@services/walletService';

export const usePayoutAccounts = () => {
  const [accounts, setAccounts] = useState<IPayoutAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAppSelector((state) => state.userProfileSlice);

  const fetchPayoutAccounts = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await walletService.getPayoutAccounts(token);

      if (response?.status === 200 && response?.data) {
        const accountsData = response.data?.dataset ?? [];
        setAccounts(accountsData as IPayoutAccount[]);
      } else if (response?.responseCode === 401) {
        setError('Authentication failed');
        setAccounts([]);
      } else {
        setAccounts([]);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payout accounts';
      setError(errorMessage);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPayoutAccounts();
  }, [fetchPayoutAccounts]);

  return {
    accounts,
    loading,
    error,
    refetch: fetchPayoutAccounts,
  };
};

