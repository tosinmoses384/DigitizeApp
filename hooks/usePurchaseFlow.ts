import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { useAppDispatch } from '@redux/store';
import marketplaceServices from '@services/features/marketplace/marketplaceServices';
import { setCheckoutData } from '@redux/slice/profile/profileSlice';

interface UsePurchaseFlowProps {
  token: string;
  countryId: string;
  itemId: string;
  offerId?: string;
}

interface PurchasePayload {
  shippingProviderId: string;
  shippingServiceTypeId: string;
  buyerAddressId: string;
  buyerContactNumber: string;
}

interface BundlePurchasePayload {
  sellerUserId: string;
  itemIds: string[];
  shippingProviderId: string;
  shippingServiceTypeId: string;
  buyerAddressId: string;
  buyerContactNumber: string;
}

export const usePurchaseFlow = ({
  token,
  countryId,
  itemId,
  offerId,
}: UsePurchaseFlowProps) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleItemPurchase = useCallback(
    async (payload: PurchasePayload) => {
      setLoading(true);
      setError(null);
      dispatch(setCheckoutData(null));

      try {
        const res: any = await marketplaceServices.makeItemPurchase(
          token,
          countryId,
          itemId,
          offerId || '',
          payload
        );

        if (res?.status === 200) {
          const data = res.data;
          console.log('data>>>>>>>>>>>>>>>>', data);
          const checkoutData = {
            checkoutProvider: data?.checkoutProvider,
            ...data?.checkoutMetadata,
          };
          dispatch(setCheckoutData(checkoutData));
          return { success: true, data: checkoutData };
        }

        if (res?.responseCode === 401) {
          router.push('/Onboarding');
          return { success: false, unauthorized: true };
        }

        const errorMessage = res?.detail || res?.message || 'Purchase failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } catch (err: any) {
        const errorMessage = err?.message || 'An unexpected error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token, countryId, itemId, offerId, dispatch]
  );

  const handleBundlePurchase = useCallback(
    async (payload: BundlePurchasePayload) => {
      setLoading(true);
      setError(null);
      dispatch(setCheckoutData(null));

      try {
        const res: any = await marketplaceServices.makeBundleItemPurchase(
          token,
          itemId,
          payload
        );

        if (res?.status === 200) {
          const data = res.data;
          const checkoutData = {
            checkoutProvider: data?.checkoutProvider,
            ...data?.checkoutMetadata,
          };
          dispatch(setCheckoutData(checkoutData));
          return { success: true, data: checkoutData };
        }

        if (res?.responseCode === 401) {
          router.push('/Onboarding');
          return { success: false, unauthorized: true };
        }

        const errorMessage = res?.detail || res?.message || 'Purchase failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } catch (err: any) {
        const errorMessage = err?.message || 'An unexpected error occurred';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [token, itemId, dispatch]
  );

  return {
    loading,
    error,
    handleItemPurchase,
    handleBundlePurchase,
  };
};
