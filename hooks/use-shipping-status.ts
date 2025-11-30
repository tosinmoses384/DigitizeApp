import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import orderServices from '@services/features/orders/orderService';
import { IShippingStatusOption } from '@services/features/orders/models';
import { useFocusEffect } from '@react-navigation/native';

interface UseShippingStatusParams {
  token: string;
  orderId: string;
  enabled?: boolean;
  refetchOnFocus?: boolean;
}

export interface ShippingStatusDropdownOption {
  key: string;
  value: string;
  label: string;
  description: string;
  id: number;
}

export const useShippingStatus = ({
  token,
  orderId,
  enabled = true,
  refetchOnFocus = false,
}: UseShippingStatusParams) => {
  const query = useQuery<ShippingStatusDropdownOption[]>({
    queryKey: ['shippingStatus', orderId],
    queryFn: async () => {
      if (__DEV__) {
        console.log('useShippingStatus: Fetching shipping status options for order:', orderId);
      }

      const response = await orderServices.getOrderShippingStatus(token, orderId);

      if (__DEV__) {
        console.log('useShippingStatus: API Response:', JSON.stringify(response, null, 2));
      }

      if (response?.status === 200 && response?.data) {
        const statusData = (response as any).data?.data || response.data;
        
        if (!Array.isArray(statusData)) {
          throw new Error('Invalid response format: data is not an array');
        }

        const options: ShippingStatusDropdownOption[] = statusData.map(
          (item: IShippingStatusOption) => ({
            key: item.id.toString(),
            value: item.id.toString(),
            label: item.name,
            description: item.description,
            id: item.id,
          })
        );

        if (__DEV__) {
          console.log('useShippingStatus: Successfully fetched', options.length, 'status options');
        }

        return options;
      }

      if (__DEV__) {
        console.warn('useShippingStatus: Invalid response:', response);
      }

      throw new Error((response as any)?.message || 'Failed to fetch shipping status options');
    },
    enabled: enabled && !!token && !!orderId,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  useFocusEffect(
    useCallback(() => {
      if (refetchOnFocus && enabled && token && orderId) {
        if (__DEV__) {
          console.log('useShippingStatus: Screen focused, refetching status options...');
        }
        query.refetch();
      }
    }, [refetchOnFocus, enabled, token, orderId, query.refetch])
  );

  return {
    ...query,
    statusOptions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

