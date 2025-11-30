import { useQuery } from '@tanstack/react-query';
import orderServices from '@services/features/orders/orderService';
import { IGetShippingDetailsResponse } from '@services/features/orders/models';
import ApiResponsePayload from '@services/http-client/abstractions/models/ApiResponsePayload';

/**
 * Custom hook to fetch and cache shipping details for an order
 * Uses React Query for efficient caching and background refetching
 * 
 * @param orderId - The unique identifier for the order
 * @param enabled - Whether the query should be enabled (default: true if orderId exists)
 * @returns React Query result with shipping details data
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useShippingDetails(orderId);
 * 
 * // Check if online shipping
 * const isOnlineShipping = data?.shippingType === "Platform";
 * ```
 */
export const useShippingDetails = (orderId: string | undefined | null, enabled: boolean = true) => {
  return useQuery<ApiResponsePayload<IGetShippingDetailsResponse>>({
    queryKey: ['shipping-details', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required to fetch shipping details');
      }
      
      const response = await orderServices.getShippingDetails(orderId);
      
      if (response?.status !== 200) {
        throw new Error(response?.message || response?.detail || 'Failed to fetch shipping details');
      }
      
      return response;
    },
    enabled: enabled && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes - shipping details don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
};

/**
 * Helper hook that extracts common shipping type checks
 * Provides convenience properties for determining shipping type
 * 
 * @param orderId - The unique identifier for the order
 * @param enabled - Whether the query should be enabled
 * @returns Shipping details with convenience properties
 * 
 * @example
 * ```typescript
 * const {
 *   shippingDetails,
 *   isOnlineShipping,
 *   isOfflineShipping,
 *   isLoading
 * } = useShippingType(orderId);
 * ```
 */
export const useShippingType = (orderId: string | undefined | null, enabled: boolean = true) => {
  const query = useShippingDetails(orderId, enabled);
  
  const shippingDetails = query.data?.data;
  
  // Determine shipping type based on API response
  // Only set to true if we have explicit confirmation from API
  const isOnlineShipping = shippingDetails?.shippingType === "Platform";
  const isOfflineShipping = shippingDetails ? shippingDetails.shippingType !== "Platform" : false;
  
  return {
    ...query,
    shippingDetails,
    isOnlineShipping,
    isOfflineShipping,
  };
};

