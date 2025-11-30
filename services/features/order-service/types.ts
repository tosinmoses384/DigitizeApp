export type OrdersRequestParamsType = {
  FilterByUser: "Buyer" | "Seller";
  FilterByStatus: "" | "InProgress" | "Completed" | "Cancelled";
  StartDate?: string | Date;
  EndDate?: string | Date;
  PageSize?: number;
  PageToken?: string;
};

export interface OrdersApiResponseType {
  data: OrdersApiResponseDataType;
  message: string;
  responseCode: string;
  status: number;
}

export interface OrdersApiResponseDataType {
  dataset: Array<OrdersItemDataType>;
  pageSize: number;
  pageItemCount: number;
  pageToken: string | null;
  hasNextPage: boolean;
  custom: Record<string, unknown> | null;
}

export interface OrdersItemDataType {
  orderId: string;
  orderImageUrl: string;
  sellerUserId: string;
  sellerName: string;
  orderDescription: string;
  orderReference: string;
  summaryStatus: string;
  status: string;
  total: number;
  currencySymbol: string;
  createdOn: Date;
}
