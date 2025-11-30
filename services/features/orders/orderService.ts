import { buildUrlWithParams } from "@helper/base-url-formater";
import ApiResponsePayload from "@services/http-client/abstractions/models/ApiResponsePayload";
import endpointService from "@services/http-client/endpoints/public/endpointClientService";
import {
  IGetDeliveryOptionsRequest,
  IGetDeliveryOptionsResponse,
  IToggleDeliveryOptionResponse,
  IGetItemOrderFeesResponse,
  IGetBundleOrderFeesResponse,
  IOrderDisputeClassification,
  ICreateOrderDisputeRequest,
  ICreateOrderDisputeResponse,
  IConfirmDeliveryResponse,
  ICreateShippingOrderProviderRequest,
  ICreateShippingOrderProviderResponse,
  IGetShippingDetailsResponse,
  IGetShippingStatusOptionsResponse,
  ICreateShippingLabelRequest,
  ICreateShippingLabelResponse,
  IGetDropOffPointsResponse,
  IGetShippingTrackingResponse,
} from "./models";
import PaginatedPayload from "@services/http-client/abstractions/models/PaginatedPayload";

const orderManagementServiceBaseUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/orders`;

/**
 * Order management service containing methods for handling seller delivery options
 * and other order-related operations.
 */
const orderServices = {
  /**
   * Retrieves available delivery options for a seller with pagination support.
   * 
   * @param request - The request parameters containing pagination details
   * @param request.pageSize - Number of items to return per page
   * @param request.pageToken - Token for pagination to get specific page
   * 
   * @returns Promise resolving to paginated list of delivery options including:
   *   - serviceTypeId: Unique identifier for the service type
   *   - serviceType: Name/type of the delivery service
   *   - serviceDescription: Detailed description of the service
   *   - providerId: Unique identifier for the delivery provider
   *   - provider: Name of the delivery provider
   *   - isActive: Boolean indicating if the option is currently active
   * 
   * @example
   * ```typescript
   * const options = await orderService.getSellerOrderDeliveryOptions({
   *   pageSize: 10,
   *   pageToken: "next_page_token"
   * });
   * ```
   */
  getSellerOrderDeliveryOptions: (
    request: IGetDeliveryOptionsRequest
  ): Promise<
    ApiResponsePayload<PaginatedPayload<IGetDeliveryOptionsResponse>>
  > => {
    return endpointService.Get(
      `${buildUrlWithParams(
        `${orderManagementServiceBaseUrl}/v1/seller/delivery-options`,
        request
      )}`
    );
  },

  /**
   * Toggles the status of a specific delivery option for a seller.
   * This operation switches the delivery option between active and inactive states.
   * 
   * @param serviceTypeId - The unique identifier of the service type to toggle
   * @param providerId - The unique identifier of the delivery provider
   * 
   * @returns Promise resolving to the updated delivery option status including:
   *   - serviceTypeId: The service type identifier that was toggled
   *   - serviceType: The name/type of the delivery service
   *   - providerId: The delivery provider identifier
   *   - status: The new status after toggle (e.g., "Active", "Inactive")
   * 
   * @throws {Error} When the service type or provider is not found
   * @throws {Error} When the user lacks permission to modify the delivery option
   * 
   * @example
   * ```typescript
   * const result = await orderService.toggleSellerOrderDeliveryOption(
   *   123, 
   *   "3fa85f64-5717-4562-b3fc-2c963f66afa6"
   * );
   * console.log(result.data.status); // "Active" or "Inactive"
   * ```
   */
  toggleSellerOrderDeliveryOption: (
    serviceTypeId: number,
    providerId: string
  ): Promise<ApiResponsePayload<IToggleDeliveryOptionResponse>> => {
    return endpointService.Put(
      `${orderManagementServiceBaseUrl}/v1/seller/delivery-options/${serviceTypeId}/providers/${providerId}`,
      {}
    );
  },

  /**
   * Retrieves detailed fee breakdown for an item order including buyer fees, 
   * seller fees, and available delivery options with their costs.
   * 
   * @param countryId - The unique identifier of the country for currency and fee calculation
   * @param itemId - The unique identifier of the item to get fees for
   * 
   * @returns Promise resolving to detailed fee information including:
   *   - itemAmount: Base amount of the item
   *   - isDiscounted: Whether a discount is applied
   *   - currency: Complete currency information
   *   - buyerFees: All fees charged to the buyer
   *   - sellerFees: All fees charged to the seller
   *   - offerId: Unique offer identifier
   *   - offerExpiryDate: When the offer expires
   *   - defaultDeliveryOption: Default selected delivery option
   *   - deliveryOptions: All available delivery options with fee breakdowns
   *   - contact: Contact information (name and phone number)
   *   - totalPayable: Total amount buyer needs to pay
   *   - totalBuyerFees: Sum of all buyer fees
   *   - totalSellerFees: Sum of all seller fees
   * 
   * @throws {Error} When the item or country is not found
   * @throws {Error} When fees cannot be calculated
   * 
   * @example
   * ```typescript
   * const fees = await orderService.getItemOrderFees(
   *   "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *   "item-123"
   * );
   * console.log(fees.data.totalPayable);
   * console.log(fees.data.contact.name);
   * ```
   */
  getItemOrderFees: (
    countryId: string,
    itemId: string
  ): Promise<ApiResponsePayload<IGetItemOrderFeesResponse>> => {
    return endpointService.Get(
      `${orderManagementServiceBaseUrl}/v1/${countryId}/orders/items/${itemId}/fees`
    );
  },

  /**
   * Retrieves detailed fee breakdown for a bundle order including buyer fees,
   * seller fees, and available delivery options with their costs.
   * 
   * @param countryId - The unique identifier of the country for currency and fee calculation
   * @param bundleId - The unique identifier of the bundle to get fees for
   * 
   * @returns Promise resolving to detailed fee information including:
   *   - bundleAmount: Base amount of the bundle
   *   - isDiscounted: Whether a discount is applied
   *   - currency: Complete currency information
   *   - buyerFees: All fees charged to the buyer
   *   - sellerFees: All fees charged to the seller
   *   - offerId: Unique offer identifier
   *   - offerExpiryDate: When the offer expires
   *   - defaultDeliveryOption: Default selected delivery option
   *   - deliveryOptions: All available delivery options with fee breakdowns
   *   - contact: Contact information (name and phone number)
   *   - totalPayable: Total amount buyer needs to pay
   *   - totalBuyerFees: Sum of all buyer fees
   *   - totalSellerFees: Sum of all seller fees
   * 
   * @throws {Error} When the bundle or country is not found
   * @throws {Error} When fees cannot be calculated
   * 
   * @example
   * ```typescript
   * const fees = await orderService.getBundleOrderFees(
   *   "3fa85f64-5717-4562-b3fc-2c963f66afa6",
   *   "bundle-456"
   * );
   * console.log(fees.data.totalPayable);
   * console.log(fees.data.contact.phoneNumber);
   * ```
   */
  getBundleOrderFees: (
    countryId: string,
    bundleId: string
  ): Promise<ApiResponsePayload<IGetBundleOrderFeesResponse>> => {
    return endpointService.Get(
      `${orderManagementServiceBaseUrl}/v1/${countryId}/orders/bundles/${bundleId}/fees`
    );
  },

  /**
   * Retrieves the list of available dispute classifications that can be used
   * when reporting an issue with an order.
   * 
   * @returns Promise resolving to array of dispute classification options including:
   *   - id: Unique identifier for the classification
   *   - name: Display name for the classification
   *   - description: Optional description of what the classification covers
   * 
   * @example
   * ```typescript
   * const classifications = await orderService.getOrderDisputeClassifications();
   * console.log(classifications.data); // [{ id: "1", name: "Item Not Received" }, ...]
   * ```
   */
  getOrderDisputeClassifications: (): Promise<
    ApiResponsePayload<IOrderDisputeClassification[]>
  > => {
    return endpointService.Get(
      `${orderManagementServiceBaseUrl}/v1/order-disputes/classifications/lov`
    );
  },

  /**
   * Creates a new order dispute report for an issue with delivery or order fulfillment.
   * This allows buyers to report problems such as non-delivery, damaged items, or
   * incorrect items received.
   * 
   * @param request - The dispute details including:
   *   - requestId: Unique identifier for the transaction/request
   *   - orderId: Unique identifier for the order being disputed
   *   - dispute: Detailed description of the issue
   *   - classification: ID of the dispute classification category
   *   - imageUrl: Optional URL to image evidence of the issue
   * 
   * @returns Promise resolving to the created dispute details including:
   *   - disputeId: Unique identifier for the created dispute
   *   - status: Current status of the dispute
   *   - createdAt: Timestamp when dispute was created
   * 
   * @throws {Error} When order or request is not found
   * @throws {Error} When user is not authorized to create dispute for this order
   * @throws {Error} When classification is invalid
   * 
   * @example
   * ```typescript
   * const dispute = await orderService.createOrderDispute({
   *   requestId: "req-123",
   *   orderId: "order-456",
   *   dispute: "Package was marked as delivered but I never received it",
   *   classification: "item-not-received",
   *   imageUrl: "https://..."
   * });
   * console.log(dispute.data.disputeId);
   * ```
   */
  createOrderDispute: (
    request: ICreateOrderDisputeRequest
  ): Promise<ApiResponsePayload<ICreateOrderDisputeResponse>> => {
    const payload: Record<string, string> = {
      requestId: request.requestId,
      orderId: request.orderId,
      dispute: request.dispute,
      classification: request.classification,
    };

    // Only include imageUrl if it's provided
    if (request.imageUrl) {
      payload.imageUrl = request.imageUrl;
    }

    return endpointService.Post(
      `${orderManagementServiceBaseUrl}/v1/order-disputes`,
      payload
    );
  },

  /**
   * Confirms delivery completion for a specific order.
   * This endpoint is called when the buyer confirms they have received the package.
   * 
   * @param orderId - The unique identifier of the order to confirm delivery for
   * 
   * @returns Promise resolving to delivery confirmation details including:
   *   - orderId: The order identifier that was confirmed
   *   - status: Updated status of the order
   *   - confirmedAt: Timestamp when delivery was confirmed
   *   - message: Confirmation message
   * 
   * @throws {Error} When the order is not found
   * @throws {Error} When the order is not in a state that allows delivery confirmation
   * @throws {Error} When the user is not authorized to confirm delivery for this order
   * 
   * @example
   * ```typescript
   * const result = await orderService.confirmDelivery("order-123");
   * console.log(result.data.status); // "Delivered"
   * console.log(result.data.message); // "Delivery confirmed successfully"
   * ```
   */
  confirmDelivery: (
    orderId: string
  ): Promise<ApiResponsePayload<IConfirmDeliveryResponse>> => {
    return endpointService.Put(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/complete`,
      {}
    );
  },

  /**
   * Confirms that the seller has dropped off the package at the designated drop-off point.
   * This endpoint is called when the seller confirms they have taken the package
   * to the shipping provider's drop-off location.
   * 
   * @param orderId - The unique identifier of the order to confirm drop-off for
   * 
   * @returns Promise resolving to drop-off confirmation details including:
   *   - orderId: The order identifier that was confirmed
   *   - status: Updated shipping status
   *   - confirmedAt: Timestamp when drop-off was confirmed
   *   - message: Confirmation message
   * 
   * @throws {Error} When the order is not found
   * @throws {Error} When the order is not in a state that allows drop-off confirmation
   * @throws {Error} When the user is not authorized to confirm drop-off for this order
   * 
   * @example
   * ```typescript
   * const result = await orderService.confirmDropOff("order-123");
   * console.log(result.data.status); // "Dropped Off"
   * console.log(result.data.message); // "Drop-off confirmed successfully"
   * ```
   * 
   * @note Backend team: Please implement this endpoint at:
   * PUT /orders/v1/orders/{orderId}/shipping/confirm-dropoff
   */
  confirmDropOff: (
    orderId: string
  ): Promise<ApiResponsePayload<IConfirmDeliveryResponse>> => {
    return endpointService.Put(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/confirm-shipment-dropOff`,
      {}
    );
  },

  /**
   * Creates shipping order provider details for offline shipping.
   * This endpoint is used to submit shipping provider information, tracking details,
   * and return address for manual/offline shipping arrangements.
   * 
   * @param orderId - The unique identifier of the order to add shipping details for
   * @param request - The shipping provider details including:
   *   - shippingProviderName: Name of the shipping company/courier
   *   - trackingNumber: Tracking number from the shipping provider
   *   - shippingNote: Additional notes about the shipment
   *   - returnAddress: Complete return address with street, location, and country
   *   - estimatedShippingDuration: Expected delivery timeframe
   *   - contactPhoneNumber: Phone number for shipping contact
   * 
   * @returns Promise resolving to the created shipping provider details including:
   *   - id: Unique identifier for the shipping record
   *   - requestId: Request identifier
   *   - All submitted shipping information
   *   - createdOn: Timestamp when the record was created
   * 
   * @throws {Error} When the order is not found
   * @throws {Error} When shipping details have already been submitted
   * @throws {Error} When required fields are missing or invalid
   * 
   * @example
   * ```typescript
   * const result = await orderService.createShippingOrderProvider("order-123", {
   *   shippingProviderName: "DHL Express",
   *   trackingNumber: "1234567890",
   *   shippingNote: "Handle with care",
   *   returnAddress: {
   *     streetNumber: "123",
   *     streetName: "Main Street",
   *     location: "Lagos",
   *     countryId: "NG"
   *   },
   *   estimatedShippingDuration: "3-5 Days",
   *   contactPhoneNumber: "+234123456789"
   * });
   * ```
   */
  createShippingOrderProvider: (
    orderId: string,
    request: ICreateShippingOrderProviderRequest
  ): Promise<ApiResponsePayload<ICreateShippingOrderProviderResponse>> => {
    return endpointService.Post(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/offline-shipping-details`,
      {
        request: request.request,
        shippingProviderName: request.shippingProviderName,
        trackingNumber: request.trackingNumber,
        shippingNote: request.shippingNote,
        returnAddress: request.returnAddress,
        estimatedShippingDuration: request.estimatedShippingDuration,
        contactPhoneNumber: request.contactPhoneNumber,
      }
    );
  },

  /**
   * Retrieves detailed shipping information for a specific order.
   * This includes the buyer's shipping address and any shipping provider
   * details that have been submitted.
   * 
   * @param orderId - The unique identifier of the order to get shipping details for
   * 
   * @returns Promise resolving to shipping details including:
   *   - orderId: The order identifier
   *   - shipTo: Complete shipping address for the buyer
   *   - shippingProvider: Shipping provider details if already submitted
   *   - returnAddress: Return address if already set
   * 
   * @throws {Error} When the order is not found
   * @throws {Error} When the user is not authorized to view this order's shipping details
   * 
   * @example
   * ```typescript
   * const details = await orderService.getShippingDetails("order-123");
   * console.log(details.data.shipTo.name); // "John Doe"
   * console.log(details.data.shipTo.address1); // "123 Main Street"
   * ```
   */
  getShippingDetails: (
    orderId: string
  ): Promise<ApiResponsePayload<IGetShippingDetailsResponse>> => {
    return endpointService.Get(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/details`
    );
  },

  /**
   * Retrieves real-time shipping tracking information with dynamic tracking events.
   * This endpoint provides comprehensive tracking data including tracking codes, URLs,
   * and a timeline of tracking events with their current status.
   * 
   * @param orderId - The unique identifier of the order to retrieve tracking for
   * 
   * @returns Promise resolving to tracking information including:
   *   - orderId: The order identifier
   *   - orderStatus: Current order status
   *   - sellerName: Name of the seller
   *   - shippingService: Service details with duration and description
   *   - trackingCodes: Array of tracking codes
   *   - trackingUrls: Array of external tracking URLs
   *   - shippingProvider: Provider name (e.g., "evri", "DHL")
   *   - orderTracking: Timeline of tracking events with hasHappened status
   * 
   * @throws {Error} When the order is not found
   * @throws {Error} When the user is not authorized to view tracking information
   * @throws {Error} When tracking information is not available for this order
   * 
   * @example
   * ```typescript
   * const tracking = await orderService.getShippingTracking("order-123");
   * const currentEvent = tracking.data.orderTracking.trackingEvents.find(e => e.hasHappened);
   * console.log(currentEvent.summary); // "Order Shipped"
   * ```
   */
  getShippingTracking: (
    orderId: string
  ): Promise<ApiResponsePayload<IGetShippingTrackingResponse>> => {
    return endpointService.Get(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/tracking`
    );
  },

  /**
   * Creates shipping tracking details for an order.
   * This endpoint is used to update the delivery status and tracking information.
   * 
   * @param token - Authentication token
   * @param request - The tracking details including:
   *   - status: Delivery status (e.g., "In Transit", "Delivered", "Out for Delivery")
   *   - description: Optional description of the status
   * @param orderId - The unique identifier of the order to update tracking for
   * 
   * @returns Promise resolving to the updated tracking information
   * 
   * @throws {Error} When the order is not found
   * @throws {Error} When the user is not authorized to update this order
   * @throws {Error} When required fields are missing or invalid
   * 
   * @example
   * ```typescript
   * const result = await orderService.createShippingTrackingDetails(token, {
   *   status: "In Transit",
   *   description: "The order is currently in transit to its destination."
   * }, "order-123");
   * ```
   */
  createShippingTrackingDetails: (
    token: string,
    request: { status: string | number; description?: string },
    orderId: string
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Post(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/offline-tracking`,
      {
        description: request.description,
        status: request.status,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Retrieves available shipping status options for an order.
   * This endpoint returns a list of valid shipping statuses that can be used
   * when updating tracking information (LOV - List of Values).
   * 
   * @param token - Authentication token
   * @param orderId - The unique identifier of the order to get status options for
   * 
   * @returns Promise resolving to list of shipping status options including:
   *   - id: Unique identifier for the status
   *   - name: Display name of the status
   *   - description: Description of what this status means
   * 
   * @throws {Error} When the order is not found
   * @throws {Error} When the user is not authorized to view this order
   * 
   * @example
   * ```typescript
   * const options = await orderService.getOrderShippingStatus(token, "order-123");
   * console.log(options.data); // [{ id: 1, name: "In Transit", description: "..." }, ...]
   * ```
   */
  getOrderShippingStatus: (
    token: string,
    orderId: string
  ): Promise<ApiResponsePayload<IGetShippingStatusOptionsResponse>> => {
    return endpointService.Get(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/shipping-status/lov`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Creates a shipping label for an order
   * This generates a shipping label with the provided return address, drop-off point, and contact details
   * @param token - Authentication token
   * @param orderId - Unique identifier for the order
   * @param request - Shipping label creation request containing return address, drop-off point, and contact phone
   * @returns Promise resolving to shipping label creation response
   */
  createShippingLabel: (
    token: string,
    orderId: string,
    request: ICreateShippingLabelRequest
  ): Promise<ApiResponsePayload<ICreateShippingLabelResponse>> => {
    return endpointService.Post(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/shipping-label`,
      request,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Gets available drop-off points for an order
   * Returns a list of physical locations where the seller can drop off the package
   * @param token - Authentication token
   * @param orderId - Unique identifier for the order
   * @param query - Optional search query to filter drop-off points by location or name
   * @returns Promise resolving to list of available drop-off points
   */
  getDropOffPoints: (
    token: string,
    orderId: string,
    query: string = ""
  ): Promise<ApiResponsePayload<IGetDropOffPointsResponse>> => {
    const url = query
      ? `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/dropoff-points/lov?Query=${encodeURIComponent(query)}`
      : `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/dropoff-points/lov`;

    return endpointService.Get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * Cancels the shipping label for an order
   * This will invalidate the existing shipping label and allow creation of a new one
   * @param token - Authentication token
   * @param orderId - Unique identifier for the order
   * @returns Promise resolving to cancellation confirmation
   */
  cancelShippingLabel: (
    token: string,
    orderId: string
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Put(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/shipping/shipping-label/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * Cancels an order specified by its ID for a given user.
   * This operation validates and updates the order as canceled in the system based on the user's permissions.
   *
   * @param token - Authentication token
   * @param orderId - The unique identifier of the order to be canceled
   * @returns Promise resolving to the cancellation response
   */
  cancelOrder: (
    token: string,
    orderId: string
  ): Promise<ApiResponsePayload<any>> => {
    return endpointService.Put(
      `${orderManagementServiceBaseUrl}/v1/orders/${orderId}/cancel`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};

export default orderServices;
