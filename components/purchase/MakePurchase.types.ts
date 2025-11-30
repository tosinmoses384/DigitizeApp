import {
  IDeliveryOptionWithFees,
  IDefaultDeliveryOption,
  ICurrency,
  IContact,
} from "@services/features/orders/models";
import { IGetItemDetailsResponse } from "@services/features/marketplace/models";

/**
 * Represents a single payment detail line item
 * Used for displaying order amount and fees
 */
export interface IBuyerPaymentDetail {
  /** Unique identifier for the payment detail */
  id: number | string;
  /** Display title/label for the payment detail */
  title: string;
  /** Amount for this line item */
  amount: number;
  /** Optional icon name to display next to the title */
  icon?: string;
}

/**
 * Bundle item structure
 * Used when displaying multiple items in a bundle purchase
 */
export interface IBundleItem {
  /** Item identifier */
  itemId?: string;
  /** Item name/title */
  itemName?: string;
  /** Default image URL for the item */
  itemDefaultImageUrl: string;
  /** Item price */
  itemPrice?: number;
  /** Item size */
  itemSize?: string;
  /** Item brand */
  itemBrand?: string;
}

/**
 * Bundle details response - extends single item with bundle-specific properties
 */
export interface IBundleDetailsResponse extends IGetItemDetailsResponse {
  /** Array of items in the bundle */
  items?: IBundleItem[];
  /** Total bundle amount */
  bundleAmount?: number;
  /** Bundle discount applied */
  bundleDiscount?: number;
}

/**
 * Props interface for the MakePurchase component
 * Handles both single item and bundle purchases
 */
export interface IMakePurchaseProps {
  /** Complete item or bundle details from the marketplace API */
  itemDetails: IGetItemDetailsResponse | IBundleDetailsResponse;
  /** Flag indicating if this is a bundle purchase */
  isBundle?: boolean;
  /** Array of payment details showing order amount and fees */
  buyerPaymentDetails: IBuyerPaymentDetail[];
  /** Available delivery options with calculated fees */
  deliveryOptions: IDeliveryOptionWithFees[];
  /** The default/pre-selected delivery option */
  defaultDeliveryOption?: IDefaultDeliveryOption;
  /** Currency information for displaying amounts */
  currency?: ICurrency;
  /** Contact information for the order */
  contact?: IContact;
  /** Hide the total to pay row when fees are unavailable */
  hideTotal?: boolean;
}
