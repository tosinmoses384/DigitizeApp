/**
 * TypeScript interfaces for shipping state management
 * Following the API specification and existing form structures
 */

// Form value types - defined locally to avoid circular dependencies
export interface ReturnAddressValues {
  streetNumber: string;
  streetName: string;
  location: string;
  countryId: string;
}

export interface ShippingProviderValues {
  providerName: string;
  trackingNumber: string;
  estimatedTimeValue: string;
  estimatedTimeUnit: string;
  notes: string;
  images: { uri: string }[];
  contactPhoneNumber?: string;
}

export interface UploadedShippingImage {
  uri: string;
  clientRequestId: string;
  uploadResult?: any;
}

// API Request/Response Types
export interface ShippingProviderRequest {
  requestId: string;
  shippingProviderName: string;
  trackingNumber: string;
  shippingNote: string;
  returnAddress: {
    streetNumber: string;
    streetName: string;
    location: string;
    countryId: string;
  };
  estimatedShippingDuration: string;
  contactPhoneNumber: string;
}

export interface ShippingProviderResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    requestId: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  };
}

// Store State Types
export interface ShippingOrder {
  orderId: string;
  shippingProvider?: ShippingProviderValues;
  returnAddress?: ReturnAddressValues;
  status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  requestId?: string; // Generated when submitted to API
}

/**
 * Shipping label specific data
 * Used for the "Get Shipping Label" flow where seller creates a label
 */
export interface ShippingLabelData {
  orderId: string | null;
  shippingDetails: any | null; // Data from getShippingDetails API
  dropOffPointId: string | null;
  dropOffPointName: string | null;
  updatedReturnAddress: ReturnAddressValues | null;
  updatedContactPhone: string | null;
  isLoadingDetails: boolean;
  isCreatingLabel: boolean;
}

export interface ShippingState {
  // Orders tracking by orderId
  orders: Record<string, ShippingOrder>;
  
  // Shared return address (can be overridden per order)
  defaultReturnAddress: ReturnAddressValues | null;
  
  // UI states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Current order being worked on (for navigation context)
  currentOrderId: string | null;
  
  // Shipping label specific state
  shippingLabel: ShippingLabelData;
}

// Store Actions
export interface ShippingActions {
  // Order management
  setCurrentOrder: (orderId: string) => void;
  createOrder: (orderId: string) => void;
  clearOrder: (orderId: string) => void;
  clearAllOrders: () => void;
  
  // Shipping provider management
  setShippingProvider: (orderId: string, data: ShippingProviderValues) => void;
  updateShippingProvider: (orderId: string, updates: Partial<ShippingProviderValues>) => void;
  
  // Return address management
  setReturnAddress: (orderId: string, data: ReturnAddressValues) => void;
  setDefaultReturnAddress: (data: ReturnAddressValues) => void;
  updateReturnAddress: (orderId: string, updates: Partial<ReturnAddressValues>) => void;
  
  // API operations
  saveShippingData: (orderId: string) => Promise<void>;
  submitShippingProvider: (orderId: string) => Promise<void>;
  getShippingDetails: (orderId: string) => Promise<any>;
  uploadShippingImages: (orderId: string, images: any[]) => Promise<UploadedShippingImage[]>;
  
  // Shipping Label specific actions
  initializeShippingLabel: (orderId: string) => void;
  fetchShippingDetailsForLabel: (orderId: string) => Promise<void>;
  updateShippingLabelDropOffPoint: (dropOffPointId: string, dropOffPointName: string) => void;
  updateShippingLabelContactPhone: (phone: string) => void;
  updateShippingLabelReturnAddress: (address: ReturnAddressValues) => void;
  submitShippingLabel: () => Promise<any>;
  clearShippingLabel: () => void;
  
  // UI state management
  setLoading: (loading: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utility actions
  getOrder: (orderId: string) => ShippingOrder | null;
  isOrderComplete: (orderId: string) => boolean;
  getOrderStatus: (orderId: string) => ShippingOrder['status'] | null;
}

// Combined store type
export type ShippingStore = ShippingState & ShippingActions;

// Selector types for optimized component subscriptions
export interface ShippingSelectors {
  currentOrder: ShippingOrder | null;
  hasShippingProvider: boolean;
  hasReturnAddress: boolean;
  isComplete: boolean;
  canProceedToNextStep: boolean;
}
