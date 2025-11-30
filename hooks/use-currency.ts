import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@redux/store';
import marketplaceServices from '@services/features/marketplace/marketplaceServices';
import { ICurrency } from '@services/features/orders/models';
import { IUserWallet } from '@services/walletService';

interface UseCurrencyOptions {
  wallet?: IUserWallet;
}

export const useCurrency = (options?: UseCurrencyOptions) => {
  const { profile } = useAppSelector((state) => state.userProfileSlice);
  const countryId = useMemo(() => profile?.countryId, [profile?.countryId]);
  const { wallet } = options || {};

  const { data: currencyData, isLoading } = useQuery<ICurrency | null>({
    queryKey: ['currency', countryId],
    queryFn: async () => {
      if (!countryId) return null;
      
      try {
        const featuresResponse = await marketplaceServices.features(countryId);
        
        if (featuresResponse?.status === 200 && featuresResponse?.data) {
          const featuresData = featuresResponse.data as any;
          
          let currencyInfo: ICurrency | null = null;
          
          if (featuresData?.country && featuresData.country.currencySymbol) {
            currencyInfo = {
              countryId: featuresData.country.id || countryId,
              currencyId: featuresData.country.currencyId || '',
              currencySymbol: featuresData.country.currencySymbol,
              currencyName: featuresData.country.currency || featuresData.country.currencyName || '',
              currencyCode: featuresData.country.currencyCode || '',
            };
          }
          else if (featuresData?.currency && typeof featuresData.currency === 'object') {
            currencyInfo = {
              countryId,
              currencyId: featuresData.currency.currencyId || '',
              currencySymbol: featuresData.currency.currencySymbol || '',
              currencyName: featuresData.currency.currencyName || '',
              currencyCode: featuresData.currency.currencyCode || '',
            };
          }
          else if (featuresData?.currencySymbol) {
            currencyInfo = {
              countryId,
              currencyId: featuresData.currencyId || '',
              currencySymbol: featuresData.currencySymbol,
              currencyName: featuresData.currencyName || '',
              currencyCode: featuresData.currencyCode || '',
            };
          }
          
          if (currencyInfo?.currencySymbol) {
            return currencyInfo;
          } 
        } 
        
      } catch {
      
      }
      
      return null;
    },
    enabled: !!countryId,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
  });

  const getCurrencyFallback = useCallback((countryId: string | undefined): string => {
    if (!countryId) return '$';
    
    const currencyMap: Record<string, string> = {
      'NG': '₦',
      'US': '$',
      'GB': '£',
      'EU': '€',
      'JP': '¥',
      'CN': '¥',
      'IN': '₹',
      'ZA': 'R',
      'KE': 'KSh',
      'GH': '₵',
    };
    
    return currencyMap[countryId] || '$';
  }, []);

  const currencySymbol = useMemo(() => {
    if (wallet?.currencySymbol) {
      return wallet.currencySymbol;
    }
    
    if (currencyData?.currencySymbol) {
      return currencyData.currencySymbol;
    }
    
    const fallbackCurrency = getCurrencyFallback(countryId);
    if (fallbackCurrency !== '$') {
      return fallbackCurrency;
    }
    
    return (profile as any)?.currencySymbol || '$';
  }, [wallet?.currencySymbol, currencyData?.currencySymbol, countryId, getCurrencyFallback, profile]);

  const currencyCode = useMemo(() => {
    if (wallet?.currencyCode) {
      return wallet.currencyCode;
    }
    
    return currencyData?.currencyCode || 'USD';
  }, [wallet?.currencyCode, currencyData?.currencyCode]);

  return {
    currencySymbol,
    currencyCode,
    currencyData,
    isLoading,
  };
};

