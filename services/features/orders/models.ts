/**
 * Request parameters for retrieving seller delivery options
 */
export interface IGetDeliveryOptionsRequest {
  /** Number of delivery options to return per page (pagination) */
  pageSize: number;
  /** Token used for pagination to retrieve specific page of results */
  pageToken: string;
}

/**
 * Response model representing a single delivery option available to sellers
 */
export interface IGetDeliveryOptionsResponse {
  /** Unique identifier for the delivery service type */
  serviceTypeId: number;
  /** Name or type of the delivery service (e.g., "Standard", "Express") */
  serviceType: string;
  /** Detailed description of what the delivery service provides */
  serviceDescription: string;
  /** Unique identifier for the delivery provider company */
  providerId: string;
  /** Name of the delivery provider company (e.g., "FedEx", "UPS") */
  provider: string;
  /** Whether this delivery option is currently active/available */
  isActive: boolean;
}

/**
 * Response model for delivery option toggle operations
 */
export interface IToggleDeliveryOptionResponse {
  /** The service type identifier that was toggled */
  serviceTypeId: number;
  /** The name/type of the delivery service that was toggled */
  serviceType: string;
  /** The delivery provider identifier */
  providerId: string;
  /** The new status after toggle operation (e.g., "Active", "Inactive") */
  status: string;
}

/**
 * Currency information model
 */
export interface ICurrency {
  /** Unique identifier for the country */
  countryId: string;
  /** Unique identifier for the currency */
  currencyId: string;
  /** Symbol representing the currency (e.g., "$", "€") */
  currencySymbol: string;
  /** Full name of the currency */
  currencyName: string;
  /** ISO currency code (e.g., "USD", "EUR") */
  currencyCode: string;
}

/**
 * Fee details model for both buyer and seller fees
 */
export interface IFeeDetail {
  /** Description of what the fee covers */
  description: string;
  /** The fee amount */
  fee: number;
  /** Minimum amount for this fee to apply */
  minimumAmount: number;
  /** Who is responsible for paying the fee */
  feePayer: string;
  /** Type of charge: "Flat" or "Percentage" */
  chargeType: "Flat" | "Percentage";
}

/**
 * Fee breakdown detail model
 */
export interface IFeeBreakdown {
  /** Unique identifier for the fee breakdown item */
  id: string;
  /** Description of the fee breakdown item */
  description: string;
  /** Fee amount for this breakdown item */
  fee: number;
}

/**
 * Delivery option model with fee information
 */
export interface IDeliveryOptionWithFees {
  /** Unique identifier for the delivery provider */
  providerId: string;
  /** Name of the delivery provider */
  provider: string;
  /** Unique identifier for the parcel box type */
  parcelBoxTypeId: number;
  /** Name/description of the parcel box type */
  parcelBoxType: string;
  /** Type of delivery service */
  serviceType: string;
  /** Unique identifier for the service type */
  serviceTypeId: number;
  /** Detailed description of the service type */
  serviceTypeDescription: string;
  /** Estimated fee for this delivery option */
  estimatedFee: number;
  /** Detailed breakdown of the delivery fee */
  breakDown: IFeeBreakdown[];
}

/**
 * Default delivery option selection
 */
export interface IDefaultDeliveryOption {
  /** Unique identifier for the delivery provider */
  providerId: string;
  /** Unique identifier for the service type */
  serviceTypeId: number;
}

/**
 * Contact information model
 */
export interface IContact {
  /** Full name of the contact person */
  name: string;
  /** Phone number of the contact person */
  phoneNumber: string;
}

/**
 * Response model for item order fees
 */
export interface IGetItemOrderFeesResponse {
  /** The base amount for the item */
  itemAmount: number;
  /** Whether the item has a discount applied */
  isDiscounted: boolean;
  /** Currency information for all monetary values */
  currency: ICurrency;
  /** List of fees charged to the buyer */
  buyerFees: IFeeDetail[];
  /** List of fees charged to the seller */
  sellerFees: IFeeDetail[];
  /** Unique identifier for the offer */
  offerId: string;
  /** Expiry date/time for the offer */
  offerExpiryDate: string;
  /** The default selected delivery option */
  defaultDeliveryOption: IDefaultDeliveryOption;
  /** Available delivery options with fees */
  deliveryOptions: IDeliveryOptionWithFees[];
  /** Contact information for the order */
  contact: IContact;
  /** Total amount payable by the buyer */
  totalPayable: number;
  /** Total of all buyer fees */
  totalBuyerFees: number;
  /** Total of all seller fees */
  totalSellerFees: number;
}

/**
 * Response model for bundle order fees
 */
export interface IGetBundleOrderFeesResponse {
  /** The base amount for the bundle */
  bundleAmount: number;
  /** Whether the bundle has a discount applied */
  isDiscounted: boolean;
  /** Currency information for all monetary values */
  currency: ICurrency;
  /** List of fees charged to the buyer */
  buyerFees: IFeeDetail[];
  /** List of fees charged to the seller */
  sellerFees: IFeeDetail[];
  /** Unique identifier for the offer */
  offerId: string;
  /** Expiry date/time for the offer */
  offerExpiryDate: string;
  /** The default selected delivery option */
  defaultDeliveryOption: IDefaultDeliveryOption;
  /** Available delivery options with fees */
  deliveryOptions: IDeliveryOptionWithFees[];
  /** Contact information for the order */
  contact: IContact;
  /** Total amount payable by the buyer */
  totalPayable: number;
  /** Total of all buyer fees */
  totalBuyerFees: number;
  /** Total of all seller fees */
  totalSellerFees: number;
}

/**
 * Order dispute classification model
 */
export interface IOrderDisputeClassification {
  /** Unique identifier for the classification */
  id: number;
  /** Name/label of the classification */
  name: string;
  /** Description of what this classification covers */
  description?: string;
}

/**
 * Request model for creating an order dispute
 */
export interface ICreateOrderDisputeRequest {
  /** Unique identifier for the request/transaction */
  requestId: string;
  /** Unique identifier for the order being disputed */
  orderId: string;
  /** Detailed description of the dispute issue */
  dispute: string;
  /** Classification ID categorizing the type of dispute */
  classification: string;
  /** Optional URL to image evidence of the issue */
  imageUrl?: string;
}

/**
 * Response model for created order dispute
 */
export interface ICreateOrderDisputeResponse {
  /** Unique identifier for the created dispute */
  disputeId: string;
  /** Status of the dispute (e.g., "Submitted", "Under Review") */
  status: string;
  /** Timestamp when the dispute was created */
  createdAt: string;
}

/**
 * Response model for confirming order delivery
 */
export interface IConfirmDeliveryResponse {
  /** Unique identifier for the order */
  orderId: string;
  /** Unique identifier for the buyer user */
  buyerUserId: string;
  /** Unique identifier for the seller user */
  sellerUserId: string;
  /** Order reference number */
  orderReference: string;
  /** Total amount of the order */
  total: number;
  /** Status of the order after delivery confirmation */
  status: string;
}

/**
 * Return address structure for shipping orders
 */
export interface IReturnAddress {
  /** Street number for the return address */
  streetNumber: string;
  /** Street name for the return address */
  streetName: string;
  /** Location/city for the return address */
  location: string;
  /** Country identifier for the return address */
  countryId: string;
}

/**
 * Request model for creating shipping order provider details
 */
export interface ICreateShippingOrderProviderRequest {
  /** Unique request identifier (GUID) */
  request: string;
  /** Name of the shipping provider */
  shippingProviderName: string;
  /** Tracking number provided by the shipping service */
  trackingNumber: string;
  /** Additional notes about the shipping */
  shippingNote: string;
  /** Return address details */
  returnAddress: IReturnAddress;
  /** Estimated duration for shipping delivery in days (integer) */
  estimatedShippingDuration: number;
  /** Contact phone number for shipping inquiries */
  contactPhoneNumber: string;
}

/**
 * Response model for creating shipping order provider
 */
export interface ICreateShippingOrderProviderResponse {
  /** Unique identifier for the shipping record */
  id: string;
  /** Request identifier */
  requestId: string;
  /** Name of the shipping provider */
  shippingProviderName: string;
  /** Tracking number */
  trackingNumber: string;
  /** Shipping notes */
  shippingNote: string;
  /** Return address string */
  returnAddress: string;
  /** Estimated shipping duration */
  estimatedShippingDuration: string;
  /** Contact phone number */
  contactPhoneNumber: string;
  /** Created timestamp */
  createdOn: string;
}

/**
 * Shipping address information (extended version with all API fields)
 */
export interface IShippingAddress {
  /** Address identifier */
  addressId?: string;
  /** Address type */
  type?: string | number;
  /** Full name of the recipient */
  name: string;
  /** First line of the address */
  address1: string;
  /** Second line of the address (optional) */
  address2?: string;
  /** Third line of the address (optional) */
  address3?: string;
  /** City */
  city?: string;
  /** State/province */
  state?: string;
  /** Postal/ZIP code */
  postcode?: string;
  /** Location/city name */
  location?: string;
  /** Location identifier */
  locationId?: string;
  /** Country ISO code */
  countryIso?: string;
  /** County */
  county?: string;
  /** Country */
  country?: string;
  /** Country identifier */
  countryId?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
}

/**
 * Shipping label information
 */
export interface IShippingLabel {
  /** Order identifier */
  orderId: string;
  /** Request identifier */
  requestId: string;
  /** Array of tracking URLs */
  trackingUrls?: string[];
  /** Array of tracking codes */
  trackingCodes?: string[];
  /** Shipping label resource URL (PDF or image) */
  shippingLabelResourceUrl?: string;
  /** Courier service name */
  courier?: string;
  /** Status of the shipping label */
  status?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Created timestamp */
  createdOn?: string;
}

/**
 * Response model for getting shipping details
 */
/**
 * Shipping service details model
 */
export interface IShippingService {
  /** Unique identifier for the shipping service */
  id: number;
  /** Name of the shipping service */
  name: string;
  /** Duration/estimated delivery time (e.g., "2-3 days") */
  duration: string;
  /** Description of the shipping service */
  description: string;
}

export interface IGetShippingDetailsResponse {
  /** Shipping details identifier */
  id?: string;
  /** Order identifier */
  orderId?: string;
  /** Shipping service details (service type, duration, description) */
  shippingService?: IShippingService;
  /** Type of shipping (e.g., "Platform", "Custom") */
  shippingType?: string;
  /** Shipping provider identifier */
  shippingProviderId?: string;
  /** Shipping provider name */
  shippingProvider?: string;
  /** Contact phone number for shipping */
  contactPhoneNumber?: string;
  /** Estimated delivery date */
  estimatedDeliveryDate?: string;
  /** Estimated delivery amount/cost */
  estimatedDeliveryAmount?: number;
  /** Shipping label details (if label already created) */
  shippingLabel?: IShippingLabel;
  /** Return address (if set) */
  returnAddress?: IReturnAddress | null;
  /** Ship from address (drop-off point or return address) */
  shipFrom?: IShippingAddress;
  /** Shipping destination details */
  shipTo?: IShippingAddress;
  /** Shipping status */
  status?: string;
}

/**
 * Individual tracking event in the order tracking timeline
 */
export interface ITrackingEvent {
  /** Unique identifier for the tracking event */
  id: string;
  /** Title of the tracking event (e.g., "Shipped", "In Transit") */
  title: string;
  /** Summary description of the tracking event */
  summary: string;
  /** Status identifier number */
  statusId: number;
  /** Current status of this tracking event */
  status: string;
  /** Whether this tracking event has occurred */
  hasHappened: boolean;
  /** Timestamp when this event was created (null if not happened yet) */
  createdOn: string | null;
}

/**
 * Order tracking information with events and metadata
 */
export interface IOrderTracking {
  /** Array of tracking events in chronological order */
  trackingEvents: ITrackingEvent[];
  /** Metadata for pagination and additional tracking info */
  metadata: {
    /** Custom metadata (can be null) */
    custom: any;
    /** Whether there are more pages of tracking events */
    hasNextPage: boolean;
    /** Token for fetching the next page */
    pageToken: string | null;
    /** Number of items per page */
    pageSize: number;
    /** Number of items in current page */
    pageItemCount: number;
  };
}

/**
 * Response model for shipping tracking with real-time tracking events
 */
export interface IGetShippingTrackingResponse {
  /** Order identifier */
  orderId: string;
  /** Current order status */
  orderStatus: string;
  /** Seller name */
  sellerName: string;
  /** Shipping service details */
  shippingService: {
    /** Service type identifier */
    id: number;
    /** Service name */
    name: string;
    /** Estimated delivery duration */
    duration: string;
    /** Service description */
    description: string;
  };
  /** Array of tracking codes for this shipment */
  trackingCodes: string[];
  /** Type of shipping (e.g., "Platform", "Custom") */
  shippingType: string;
  /** Shipping label details if available */
  shippingLabel: {
    /** Order identifier */
    orderId: string;
    /** Request identifier */
    requestId: string;
    /** Array of tracking URLs */
    trackingUrls: string[];
    /** Array of tracking codes */
    trackingCodes: string[];
    /** URL to download shipping label PDF */
    shippingLabelResourceUrl: string;
    /** Courier/carrier name */
    courier: string;
    /** Label status */
    status: string;
    /** Additional metadata */
    metadata: Record<string, any>;
    /** Creation timestamp */
    createdOn: string;
  };
  /** Shipping provider identifier */
  shippingProviderId: string;
  /** Shipping provider name */
  shippingProvider: string;
  /** Estimated shipping duration in days */
  estimatedShippingDuration: number;
  /** Whether updates are allowed */
  shouldAllowUpdate: boolean;
  /** Current shipping status */
  status: string;
  /** Order tracking information with events */
  orderTracking: IOrderTracking;
  /** Estimated delivery date (optional) */
  estimatedDeliveryDate?: string;
}

/**
 * Shipping status option
 */
export interface IShippingStatusOption {
  /** Unique identifier for the status */
  id: number;
  /** Display name of the status */
  name: string;
  /** Description of what this status means */
  description: string;
}

/**
 * Response model for getting shipping status options (LOV - List of Values)
 */
export interface IGetShippingStatusOptionsResponse {
  /** Array of available shipping status options */
  data: IShippingStatusOption[];
  /** Response message */
  message: string;
  /** Response code */
  responseCode: string;
  /** HTTP status code */
  status: number;
}

/**
 * Request model for creating a shipping label
 * This is submitted when the seller generates a shipping label for an order
 */
export interface ICreateShippingLabelRequest {
  /** Return address details for the shipping label */
  returnAddress: {
    /** Street number portion of the address (e.g., "123") */
    streetNumber: string;
    /** Street name portion of the address (e.g., "Main Street") */
    streetName: string;
    /** City or location name */
    location: string;
    /** Country identifier */
    countryId: string;
  };
  /** Selected drop-off point identifier */
  dropOffPointId: string;
  /** Contact phone number for shipping */
  contactPhone: string;
}

/**
 * Response model for shipping label creation
 */
export interface ICreateShippingLabelResponse {
  /** Label creation details */
  data: {
    /** Unique identifier for the shipping label */
    labelId: string;
    /** Label URL or reference */
    labelUrl?: string;
    /** Tracking number */
    trackingNumber?: string;
  };
  /** Response message */
  message: string;
  /** Response code */
  responseCode: string;
  /** HTTP status code */
  status: number;
}

/**
 * Drop-off point location details
 */
export interface IDropOffPoint {
  /** Unique identifier for the drop-off point */
  id: string;
  /** Name of the drop-off location */
  name: string;
  /** Primary address of the drop-off point - can be string or object */
  address: string | { address1?: string; address2?: string; [key: string]: any };
  /** Secondary address line (optional) */
  address2?: string;
  /** Contact phone number for the drop-off point */
  phone?: string;
  /** Business hours information */
  businessHours?: any;
  /** Additional location details */
  [key: string]: any;
}

/**
 * Response model for getting drop-off points list
 */
export interface IGetDropOffPointsResponse {
  /** Array of available drop-off points */
  data: IDropOffPoint[];
  /** Response message */
  message: string;
  /** Response code */
  responseCode: string;
  /** HTTP status code */
  status: number;
}
