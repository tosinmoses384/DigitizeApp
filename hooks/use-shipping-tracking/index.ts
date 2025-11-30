import { useQuery } from '@tanstack/react-query';
import orderServices from '@services/features/orders/orderService';
import { IGetShippingTrackingResponse } from '@services/features/orders/models';
import ApiResponsePayload from '@services/http-client/abstractions/models/ApiResponsePayload';

/**
 * Custom hook to fetch and cache real-time shipping tracking information
 * Uses React Query for efficient caching and background refetching
 * Provides dynamic tracking events from the backend
 * 
 * @param orderId - The unique identifier for the order
 * @param enabled - Whether the query should be enabled (default: true if orderId exists)
 * @returns React Query result with shipping tracking data including dynamic tracking events
 * 
 * @section Architecture Requirements - Custom hook layer for API integration
 * @section Asynchronous Operations - Uses React Query with proper error handling
 * @section Performance - Implements caching strategy with stale time and gc time
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = useShippingTracking(orderId);
 * 
 * const trackingEvents = data?.data?.orderTracking?.trackingEvents;
 * const currentStep = trackingEvents?.findIndex(e => e.hasHappened);
 * ```
 */
export const useShippingTracking = (
  orderId: string | undefined | null,
  enabled: boolean = true
) => {
  return useQuery<ApiResponsePayload<IGetShippingTrackingResponse>>({
    queryKey: ['shipping-tracking', orderId],
    queryFn: async () => {
      if (!orderId) {
        throw new Error('Order ID is required to fetch shipping tracking');
      }
      
      const response = await orderServices.getShippingTracking(orderId);
      
      if (response?.status !== 200) {
        throw new Error(
          response?.message || 
          response?.detail || 
          'Failed to fetch shipping tracking'
        );
      }
      
      return response;
    },
    enabled: enabled && !!orderId,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * Helper hook that extracts tracking events and provides convenience utilities
 * Provides easy access to tracking timeline and current step information
 * 
 * @param orderId - The unique identifier for the order
 * @param enabled - Whether the query should be enabled
 * @returns Tracking data with convenience properties
 * 
 * @section Performance - Uses memoization through React Query
 * 
 * @example
 * ```typescript
 * const {
 *   trackingData,
 *   trackingEvents,
 *   currentStepIndex,
 *   isLoading
 * } = useTrackingEvents(orderId);
 * ```
 */
export const useTrackingEvents = (
  orderId: string | undefined | null,
  enabled: boolean = true
) => {
  const query = useShippingTracking(orderId, enabled);
  
  const trackingData = query.data?.data;
  const trackingEvents = trackingData?.orderTracking?.trackingEvents || [];
  
  const currentStepIndex = trackingEvents.findIndex(event => !event.hasHappened);
  
  const lastCompletedStepIndex = currentStepIndex > 0 ? currentStepIndex - 1 : 
                                  trackingEvents.every(e => e.hasHappened) ? trackingEvents.length - 1 : -1;
  
  return {
    ...query,
    trackingData,
    trackingEvents,
    currentStepIndex,
    lastCompletedStepIndex,
  };
};

