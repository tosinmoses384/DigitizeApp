/**
 * Zustand store for shipping state management
 * First implementation of Zustand in the codebase
 * Following best practices and existing patterns
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Platform } from 'react-native';
import { generateGUID } from '@helper/guid-number';
import { 
  ShippingStore, 
  ShippingOrder, 
  ShippingProviderValues, 
  ReturnAddressValues,
  ShippingProviderRequest,
  UploadedShippingImage
} from './types';

import orderServices from '@services/features/orders/orderService';
import fileServerServices from '@services/features/file-server/fileServer';
import { store } from '@redux/store';
import type { 
  ICreateShippingOrderProviderRequest,
  ICreateShippingLabelRequest 
} from '@services/features/orders/models';
import { parseAddressForSubmission } from '@utils/address-parser';

// Initial state
const initialState = {
  orders: {},
  defaultReturnAddress: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  currentOrderId: null,
  shippingLabel: {
    orderId: null,
    shippingDetails: null,
    dropOffPointId: null,
    dropOffPointName: null,
    updatedReturnAddress: null,
    updatedContactPhone: null,
    isLoadingDetails: false,
    isCreatingLabel: false,
  },
};

// Create the store with devtools support for debugging
export const useShippingStore = create<ShippingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Order management actions
      setCurrentOrder: (orderId: string) => {
        set({ currentOrderId: orderId }, false, 'setCurrentOrder');
        
        // Create order if it doesn't exist
        const { orders } = get();
        if (!orders[orderId]) {
          get().createOrder(orderId);
        }
      },

      createOrder: (orderId: string) => {
        const newOrder: ShippingOrder = {
          orderId,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set(
          (state) => ({
            orders: {
              ...state.orders,
              [orderId]: newOrder,
            },
          }),
          false,
          'createOrder'
        );
      },

      clearOrder: (orderId: string) => {
        set(
          (state) => {
            const newOrders = { ...state.orders };
            delete newOrders[orderId];
            
            return {
              orders: newOrders,
              currentOrderId: state.currentOrderId === orderId ? null : state.currentOrderId,
            };
          },
          false,
          'clearOrder'
        );
      },

      clearAllOrders: () => {
        set({ orders: {}, currentOrderId: null }, false, 'clearAllOrders');
      },

      // Shipping provider management
      setShippingProvider: (orderId: string, data: ShippingProviderValues) => {
        set(
          (state) => ({
            orders: {
              ...state.orders,
              [orderId]: {
                ...state.orders[orderId],
                shippingProvider: data,
                updatedAt: new Date().toISOString(),
                status: 'draft',
              },
            },
          }),
          false,
          'setShippingProvider'
        );
      },

      updateShippingProvider: (orderId: string, updates: Partial<ShippingProviderValues>) => {
        set(
          (state) => {
            const order = state.orders[orderId];
            if (!order) return state;

            return {
              ...state,
              orders: {
                ...state.orders,
                [orderId]: {
                  ...order,
                  shippingProvider: {
                    ...order.shippingProvider,
                    ...updates,
                  } as ShippingProviderValues,
                  updatedAt: new Date().toISOString(),
                },
              },
            };
          },
          false,
          'updateShippingProvider'
        );
      },

      // Return address management
      setReturnAddress: (orderId: string, data: ReturnAddressValues) => {
        set(
          (state) => ({
            orders: {
              ...state.orders,
              [orderId]: {
                ...state.orders[orderId],
                returnAddress: data,
                updatedAt: new Date().toISOString(),
                status: state.orders[orderId]?.shippingProvider ? 'draft' : 'draft',
              },
            },
          }),
          false,
          'setReturnAddress'
        );
      },

      setDefaultReturnAddress: (data: ReturnAddressValues) => {
        set({ defaultReturnAddress: data }, false, 'setDefaultReturnAddress');
      },

      updateReturnAddress: (orderId: string, updates: Partial<ReturnAddressValues>) => {
        set(
          (state) => {
            const order = state.orders[orderId];
            if (!order) return state;

            return {
              ...state,
              orders: {
                ...state.orders,
                [orderId]: {
                  ...order,
                  returnAddress: {
                    ...order.returnAddress,
                    ...updates,
                  } as ReturnAddressValues,
                  updatedAt: new Date().toISOString(),
                },
              },
            };
          },
          false,
          'updateReturnAddress'
        );
      },

      // API operations
      saveShippingData: async (orderId: string) => {
        const { orders } = get();
        const order = orders[orderId];
        
        if (!order) {
          set({ error: 'Order not found' }, false, 'saveShippingData/error');
          return;
        }

        set({ isLoading: true, error: null }, false, 'saveShippingData/start');

        try {
          // For now, simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update order status
          set(
            (state) => ({
              orders: {
                ...state.orders,
                [orderId]: {
                  ...state.orders[orderId],
                  status: 'pending',
                  updatedAt: new Date().toISOString(),
                },
              },
              isLoading: false,
            }),
            false,
            'saveShippingData/success'
          );
        } catch (error) {
          set(
            { 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to save shipping data' 
            },
            false,
            'saveShippingData/error'
          );
        }
      },

      submitShippingProvider: async (orderId: string) => {
        const { orders } = get();
        const order = orders[orderId];
        
        if (!order?.shippingProvider || !order?.returnAddress) {
          set({ error: 'Shipping provider and return address are required' }, false, 'submitShippingProvider/error');
          return;
        }

        set({ isSubmitting: true, error: null }, false, 'submitShippingProvider/start');

        try {
          const state = store.getState();
          const token = state.userProfileSlice?.token;
          
          if (!token) {
            throw new Error('Authentication token not found');
          }
          
          if (__DEV__) {
            console.log('Submitting shipping provider for order:', orderId);
          }

          const estimatedDurationInDays = parseInt(order.shippingProvider.estimatedTimeValue) || 0;
          
          const requestData: ICreateShippingOrderProviderRequest = {
            request: generateGUID(),
            shippingProviderName: order.shippingProvider.providerName,
            trackingNumber: order.shippingProvider.trackingNumber,
            shippingNote: order.shippingProvider.notes,
            returnAddress: {
              streetNumber: order.returnAddress.streetNumber,
              streetName: order.returnAddress.streetName,
              location: order.returnAddress.location,
              countryId: order.returnAddress.countryId,
            },
            estimatedShippingDuration: estimatedDurationInDays,
            contactPhoneNumber: order.shippingProvider.contactPhoneNumber || '',
          };

          const response = await orderServices.createShippingOrderProvider(orderId, requestData);
          
          if (response.status === 200 || response.status === 201) {
            set(
              (state) => ({
                orders: {
                  ...state.orders,
                  [orderId]: {
                    ...state.orders[orderId],
                    requestId: response.data?.requestId,
                    status: 'confirmed',
                    updatedAt: new Date().toISOString(),
                  },
                },
                isSubmitting: false,
              }),
              false,
              'submitShippingProvider/success'
            );
          } else {
            throw new Error(response.message || 'Failed to submit shipping provider');
          }
        } catch (error) {
          set(
            { 
              isSubmitting: false, 
              error: error instanceof Error ? error.message : 'Failed to submit shipping provider' 
            },
            false,
            'submitShippingProvider/error'
          );
          throw error;
        }
      },

      getShippingDetails: async (orderId: string) => {
        set({ isLoading: true, error: null }, false, 'getShippingDetails/start');

        try {
          const state = store.getState();
          const token = state.userProfileSlice?.token;
          
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await orderServices.getShippingDetails(orderId);
          
          if (response.status === 200 && response.data) {
            set({ isLoading: false }, false, 'getShippingDetails/success');
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to get shipping details');
          }
        } catch (error) {
          set(
            { 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to get shipping details' 
            },
            false,
            'getShippingDetails/error'
          );
          throw error;
        }
      },

      uploadShippingImages: async (orderId: string, images: any[]) => {
        if (!images || images.length === 0) {
          return [];
        }

        set({ isLoading: true, error: null }, false, 'uploadShippingImages/start');

        try {
          const state = store.getState();
          const token = state.userProfileSlice?.token;
          
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const isAndroid = Platform.OS === 'android';
          const uploadedImages: UploadedShippingImage[] = [];

          for (const image of images) {
            const clientRequestId = generateGUID();
            const imageData = {
              imageUri: image.uri,
              type: image.mimeType || 'image/jpeg',
            };

            const uploadResult = await fileServerServices.itemImageUpload(
              [imageData],
              isAndroid,
              clientRequestId,
              token
            );

            if (uploadResult.status === 200) {
              uploadedImages.push({
                uri: image.uri,
                clientRequestId,
                uploadResult,
              });
            }
          }

          set({ isLoading: false }, false, 'uploadShippingImages/success');
          return uploadedImages;
        } catch (error) {
          set(
            { 
              isLoading: false, 
              error: error instanceof Error ? error.message : 'Failed to upload images' 
            },
            false,
            'uploadShippingImages/error'
          );
          throw error;
        }
      },

      // Shipping Label specific actions
      initializeShippingLabel: (orderId: string) => {
        set(
          {
            shippingLabel: {
              orderId,
              shippingDetails: null,
              dropOffPointId: null,
              dropOffPointName: null,
              updatedReturnAddress: null,
              updatedContactPhone: null,
              isLoadingDetails: false,
              isCreatingLabel: false,
            },
          },
          false,
          'initializeShippingLabel'
        );
      },

      fetchShippingDetailsForLabel: async (orderId: string) => {
        set(
          (state) => ({
            shippingLabel: {
              ...state.shippingLabel,
              orderId,
              isLoadingDetails: true,
            },
          }),
          false,
          'fetchShippingDetailsForLabel/start'
        );

        try {
          const response = await orderServices.getShippingDetails(orderId);

          if (response.status === 200 && response.data) {
            set(
              (state) => ({
                shippingLabel: {
                  ...state.shippingLabel,
                  shippingDetails: response.data,
                  isLoadingDetails: false,
                },
              }),
              false,
              'fetchShippingDetailsForLabel/success'
            );
          } else {
            throw new Error(response.message || 'Failed to fetch shipping details');
          }
        } catch (error) {
          set(
            (state) => ({
              shippingLabel: {
                ...state.shippingLabel,
                isLoadingDetails: false,
              },
              error: error instanceof Error ? error.message : 'Failed to fetch shipping details',
            }),
            false,
            'fetchShippingDetailsForLabel/error'
          );
          throw error;
        }
      },

      updateShippingLabelDropOffPoint: (dropOffPointId: string, dropOffPointName: string) => {
        set(
          (state) => ({
            shippingLabel: {
              ...state.shippingLabel,
              dropOffPointId,
              dropOffPointName,
            },
          }),
          false,
          'updateShippingLabelDropOffPoint'
        );
      },

      updateShippingLabelContactPhone: (phone: string) => {
        set(
          (state) => ({
            shippingLabel: {
              ...state.shippingLabel,
              updatedContactPhone: phone,
            },
          }),
          false,
          'updateShippingLabelContactPhone'
        );
      },

      updateShippingLabelReturnAddress: (address: ReturnAddressValues) => {
        set(
          (state) => ({
            shippingLabel: {
              ...state.shippingLabel,
              updatedReturnAddress: address,
            },
          }),
          false,
          'updateShippingLabelReturnAddress'
        );
      },

      submitShippingLabel: async () => {
        const state = get();
        const { shippingLabel } = state;
        const { orderId, shippingDetails, dropOffPointId, updatedReturnAddress, updatedContactPhone } = shippingLabel;

        if (!orderId) {
          throw new Error('Order ID is required');
        }

        if (!dropOffPointId) {
          throw new Error('Please select a drop-off point');
        }

        // Get the return address - either updated or from shipping details
        const returnAddressString = updatedReturnAddress
          ? `${updatedReturnAddress.streetNumber} ${updatedReturnAddress.streetName}`.trim()
          : shippingDetails?.shipFrom?.address1;

        if (!returnAddressString) {
          throw new Error('Please enter a return address');
        }

        // Get contact phone - either updated or from shipping details
        const contactPhone = updatedContactPhone || shippingDetails?.shipFrom?.phone;

        if (!contactPhone) {
          throw new Error('Please enter a contact phone number');
        }

        set(
          (state) => ({
            shippingLabel: {
              ...state.shippingLabel,
              isCreatingLabel: true,
            },
          }),
          false,
          'submitShippingLabel/start'
        );

        try {
          const reduxState = store.getState();
          const token = reduxState.userProfileSlice?.token;
          const profile = reduxState.userProfileSlice?.profile;

          if (!token) {
            throw new Error('Authentication token not found');
          }

          // Parse the address into street number and street name
          const { streetNumber, streetName } = updatedReturnAddress
            ? {
                streetNumber: updatedReturnAddress.streetNumber,
                streetName: updatedReturnAddress.streetName,
              }
            : parseAddressForSubmission(returnAddressString);

          // Build the request payload
          const request: ICreateShippingLabelRequest = {
            returnAddress: {
              streetNumber: streetNumber || '',
              streetName: streetName || returnAddressString,
              location: updatedReturnAddress?.location || profile?.countryName || '',
              countryId: updatedReturnAddress?.countryId || profile?.countryId || '',
            },
            dropOffPointId,
            contactPhone,
          };

          const response = await orderServices.createShippingLabel(token, orderId, request);

          if (response.status === 200) {
            set(
              (state) => ({
                shippingLabel: {
                  ...state.shippingLabel,
                  isCreatingLabel: false,
                },
              }),
              false,
              'submitShippingLabel/success'
            );

            return response;
          } else {
            throw new Error(response.message || 'Failed to create shipping label');
          }
        } catch (error) {
          set(
            (state) => ({
              shippingLabel: {
                ...state.shippingLabel,
                isCreatingLabel: false,
              },
              error: error instanceof Error ? error.message : 'Failed to create shipping label',
            }),
            false,
            'submitShippingLabel/error'
          );
          throw error;
        }
      },

      clearShippingLabel: () => {
        set(
          {
            shippingLabel: {
              orderId: null,
              shippingDetails: null,
              dropOffPointId: null,
              dropOffPointName: null,
              updatedReturnAddress: null,
              updatedContactPhone: null,
              isLoadingDetails: false,
              isCreatingLabel: false,
            },
          },
          false,
          'clearShippingLabel'
        );
      },

      // UI state management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'setLoading');
      },

      setSubmitting: (submitting: boolean) => {
        set({ isSubmitting: submitting }, false, 'setSubmitting');
      },

      setError: (error: string | null) => {
        set({ error }, false, 'setError');
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      // Utility actions
      getOrder: (orderId: string) => {
        const { orders } = get();
        return orders[orderId] || null;
      },

      isOrderComplete: (orderId: string) => {
        const { orders } = get();
        const order = orders[orderId];
        
        if (!order) return false;
        
        return !!(
          order.shippingProvider &&
          order.returnAddress &&
          order.status !== 'draft'
        );
      },

      getOrderStatus: (orderId: string) => {
        const { orders } = get();
        const order = orders[orderId];
        return order?.status || null;
      },
    }),
    {
      name: 'shipping-store', // unique name for devtools
    }
  )
);

// Selectors for optimized component subscriptions
export const shippingSelectors = {
  currentOrder: (state: ShippingStore) => {
    if (!state.currentOrderId) return null;
    return state.orders[state.currentOrderId] || null;
  },

  hasShippingProvider: (state: ShippingStore) => {
    if (!state.currentOrderId) return false;
    const order = state.orders[state.currentOrderId];
    return !!(order?.shippingProvider?.providerName && order?.shippingProvider?.trackingNumber);
  },

  hasReturnAddress: (state: ShippingStore) => {
    if (!state.currentOrderId) return false;
    const order = state.orders[state.currentOrderId];
    return !!(
      order?.returnAddress?.streetNumber &&
      order?.returnAddress?.streetName &&
      order?.returnAddress?.location &&
      order?.returnAddress?.countryId
    );
  },

  isComplete: (state: ShippingStore) => {
    if (!state.currentOrderId) return false;
    const order = state.orders[state.currentOrderId];
    return !!(
      order?.shippingProvider?.providerName &&
      order?.shippingProvider?.trackingNumber &&
      order?.returnAddress?.streetNumber &&
      order?.returnAddress?.streetName &&
      order?.returnAddress?.location &&
      order?.returnAddress?.countryId
    );
  },

  canProceedToNextStep: (state: ShippingStore) => {
    if (!state.currentOrderId) return false;
    const order = state.orders[state.currentOrderId];
    return !!(
      order?.shippingProvider?.providerName &&
      order?.shippingProvider?.trackingNumber
    );
  },
};

// Export store instance for direct access if needed
export default useShippingStore;
