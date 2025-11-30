import { useState, useCallback } from 'react';
import { useAppSelector } from '@redux/store';
import walletService, { IPayoutRequest } from '@services/walletService';

interface UseWithdrawalRequestResult {
  isLoading: boolean;
  error: string | null;
  requestWithdrawal: (amount: number, walletId: string, narration?: string) => Promise<boolean>;
}

export const useWithdrawalRequest = (): UseWithdrawalRequestResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAppSelector((state) => state.userProfileSlice);

  const requestWithdrawal = useCallback(async (
    amount: number,
    walletId: string,
    narration?: string
  ): Promise<boolean> => {
    if (!token) {
      setError('Authentication token not available');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const requestId = `WD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const payoutData: IPayoutRequest = {
        requestId,
        walletId,
        amount,
      };

      if (narration && narration.trim()) {
        payoutData.narration = narration.trim();
      }

      const response = await walletService.requestPayout(token, payoutData);

      if (response?.status === 200 || response?.status === 201) {
        return true;
      }

      const errorMessage = (response as any)?.message || 'Failed to process withdrawal request';
      setError(errorMessage);
      return false;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  return {
    isLoading,
    error,
    requestWithdrawal,
  };
};

