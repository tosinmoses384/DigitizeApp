import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@redux/store';
import walletService, { IUserWallet } from '@services/walletService';

export const useWalletBalance = () => {
  const { token } = useAppSelector((state) => state.userProfileSlice);

  return useQuery({
    queryKey: ['walletBalance'],
    queryFn: async () => {
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await walletService.getUserWallets(token);

      if (response?.status === 200 && response?.data) {
        const wallets =
          (response.data as any)?.dataset ??
          (Array.isArray((response.data as any)?.data) ? (response.data as any).data : []);
        return (wallets?.[0] as IUserWallet) || undefined;
      }

      return undefined;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

