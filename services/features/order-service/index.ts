import endpointService from "@services/http-client/endpoints/public/endpointClientService";
import { formatDateForOrdersQuery } from "@utils/date-helper";
import {
  OrdersApiResponseDataType,
  OrdersRequestParamsType,
} from "@services/features/order-service/types";

const BASE_URL = `${process.env.EXPO_PUBLIC_API_BASE_URL}/orders/v1/orders`;

export const orderService = {
  getOrders: async (
    params: OrdersRequestParamsType,
    token: string,
    pageParam?: { pageSize: number; pageToken: string | null },
  ) => {
    const queryParams = [
      `FilterByUser=${params.FilterByUser ?? "Buyer"}`,
      params.FilterByStatus
        ? `FilterByStatus=${params.FilterByStatus}`
        : "",
      params.StartDate
        ? `StartDate=${params.StartDate instanceof Date ? formatDateForOrdersQuery(params.StartDate) : params.StartDate}`
        : "",
      params.EndDate
        ? `EndDate=${params.EndDate instanceof Date ? formatDateForOrdersQuery(params.EndDate) : params.EndDate}`
        : "",
      params.PageSize ? `PageSize=${params.PageSize}` : "",
      (params.PageToken ?? pageParam?.pageToken)
        ? `PageToken=${params.PageToken ?? pageParam?.pageToken}`
        : "",
    ]
      .filter(Boolean)
      .join("&");
    const url = `${BASE_URL}?${queryParams}`;
    return endpointService.Get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
