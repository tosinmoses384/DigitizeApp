/**
 * Shipping Service for API operations
 * Following existing service patterns in the codebase
 */

import ApiResponsePayload from "../../http-client/abstractions/models/ApiResponsePayload";
import endpointService from "../../http-client/endpoints/public/endpointClientService";
import { 
  ShippingProviderRequest, 
  ShippingProviderResponse 
} from "../../../stores/types";

/**
 * Shipping service for handling shipping-related API calls
 * Following the existing service patterns in the codebase
 */
const shippingService = {
  /**
   * Submit shipping provider details to the API
   * @param requestData - Shipping provider request data
   * @param token - Authentication token
   * @returns Promise<ApiResponsePayload<ShippingProviderResponse>>
   */
  submitShippingProvider: (
    requestData: ShippingProviderRequest,
    token: string
  ): Promise<ApiResponsePayload<ShippingProviderResponse>> => {
    return endpointService.Post<ShippingProviderRequest, ShippingProviderResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/shipping/v1/provider`,
      {
        requestId: requestData.requestId,
        shippingProviderName: requestData.shippingProviderName,
        trackingNumber: requestData.trackingNumber,
        shippingNote: requestData.shippingNote,
        returnAddress: requestData.returnAddress,
        estimatedShippingDuration: requestData.estimatedShippingDuration,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Get shipping status for an order
   * @param orderId - Order identifier
   * @param token - Authentication token
   * @returns Promise<ApiResponsePayload<any>>
   */
  getShippingStatus: (
    orderId: string,
    token: string
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Get<any>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/shipping/v1/status/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Update shipping status
   * @param orderId - Order identifier
   * @param status - New status
   * @param token - Authentication token
   * @returns Promise<ApiResponsePayload<any>>
   */
  updateShippingStatus: (
    orderId: string,
    status: string,
    token: string
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Put<any>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/shipping/v1/status/${orderId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Mock implementation for development/testing
   * Simulates API call with realistic delay and response
   */
  mockSubmitShippingProvider: async (
    requestData: ShippingProviderRequest
  ): Promise<ShippingProviderResponse> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (__DEV__) {
      console.log('Mock API call - submitting shipping provider:', requestData.requestId);
    }
    
    // Simulate random success/failure for testing
    const isSuccess = Math.random() > 0.1; // 90% success rate
    
    if (!isSuccess) {
      throw new Error('Network error: Failed to submit shipping provider details');
    }
    
    return {
      success: true,
      message: 'Shipping provider details submitted successfully',
      data: {
        orderId: `ORDER_${Date.now()}`,
        requestId: requestData.requestId,
        status: 'confirmed',
      },
    };
  },

  /**
   * Mock implementation for getting shipping status
   */
  mockGetShippingStatus: async (orderId: string): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        orderId,
        status: 'confirmed',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    };
  },
};

export default shippingService;
