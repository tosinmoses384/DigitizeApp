import ApiResponsePayload from "./http-client/abstractions/models/ApiResponsePayload";
import PaginatedPayload from "./http-client/abstractions/models/PaginatedPayload";
import endpointService from "./http-client/endpoints/public/endpointClientService";

export enum PayoutAccountStatus {
  ACTIVE = "Active",
  PENDING = "Pending",
  INACTIVE = "Inactive",
  SUSPENDED = "Suspended",
}

export interface IPayoutAccount {
  id: string;
  institutionName: string;
  institutionCode: string;
  accountName: string;
  accountNumber: string;
  status: PayoutAccountStatus;
  createdOn: string;
}

export type IPayoutAccountsResponse = PaginatedPayload<IPayoutAccount>;

export interface IPayoutRequirementField {
  order: number;
  fieldName: string;
  description: string;
  displayName: string;
  fieldType: "Text" | "Select" | "Date";
  isRequired: boolean;
  validationPattern: string | null;
  placeholder: string | null;
  options: Record<string, string> | null;
}

export interface IPayoutRequirementsResponse {
  countryCountry: string;
  fields: IPayoutRequirementField[];
}

export interface ICreatePayoutAccountRequest {
  [key: string]: string | number | boolean;
}

export interface ICreatePayoutAccountResponse {
  id: string;
  accountNumber: string;
  accountName: string;
  institutionName: string;
  status: PayoutAccountStatus;
}

export interface IUserWallet {
  walletId: string;
  accountName: string;
  accountNumber: string;
  availableBalance: number;
  ledgerBalance: number;
  escrowPendingBalance: number;
  createdOn: string;
  currencySymbol: string;
  currencyCode: string;
  creationTime?: string;
  balance?: number;
}

export type IUserWalletsResponse = PaginatedPayload<IUserWallet>;

export interface ITransactionHistoryItem {
  id: string;
  descrption: string;
  ledgerEntrySide: string;
  transactionReference: string;
  amount: number;
  currencyCode: string;
  transactionDate: string;
}

export type ITransactionHistoryResponse = PaginatedPayload<ITransactionHistoryItem>;

export interface IPayoutRequest {
  requestId: string;
  walletId: string;
  narration?: string;
  amount: number;
}

export interface IPayoutRequestResponse {
  id: string;
  requestId: string;
  walletId: string;
  amount: number;
  status: string;
  createdOn: string;
}

export interface IPayoutHistoryItem {
  id: string;
  transactionReference: string;
  narration: string;
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
  amount: number;
  senderWalletAccountNumber: string;
  senderWalletAccountName: string;
  status: string;
  createdOn: string;
  updatedAt: string;
}

export type IPayoutHistoryResponse = PaginatedPayload<IPayoutHistoryItem>;

const walletService = {
  getPayoutAccounts: (
    token: string
  ): Promise<ApiResponsePayload<IPayoutAccountsResponse>> => {
    return endpointService.Get<IPayoutAccountsResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wallet/v1/user-payout/accounts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  getPayoutRequirements: (
    token: string
  ): Promise<ApiResponsePayload<IPayoutRequirementsResponse>> => {
    return endpointService.Get<IPayoutRequirementsResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wallet/v1/user-payout/accounts/requirements`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  createPayoutAccount: (
    token: string,
    accountData: ICreatePayoutAccountRequest
  ): Promise<ApiResponsePayload<ICreatePayoutAccountResponse>> => {
    return endpointService.Post<
      ICreatePayoutAccountRequest,
      ICreatePayoutAccountResponse
    >(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wallet/v1/user-payout/account`,
      accountData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  getUserWallets: (
    token: string
  ): Promise<ApiResponsePayload<IUserWalletsResponse>> => {
    return endpointService.Get<IUserWalletsResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wallet/v1/user-wallets`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  getTransactionHistory: (
    token: string,
    pageSize: number = 20,
    pageToken?: string
  ): Promise<ApiResponsePayload<ITransactionHistoryResponse>> => {
    const queryParams = [
      `pageSize=${pageSize}`,
      pageToken ? `pageToken=${encodeURIComponent(pageToken)}` : '',
    ]
      .filter(Boolean)
      .join('&');

    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/wallet/v1/user-transaction/history?${queryParams}`;

    return endpointService.Get<ITransactionHistoryResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  requestPayout: (
    token: string,
    payoutData: IPayoutRequest
  ): Promise<ApiResponsePayload<IPayoutRequestResponse>> => {
    return endpointService.Post<IPayoutRequest, IPayoutRequestResponse>(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/wallet/v1/user-payout/request`,
      payoutData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  getPayoutHistory: (
    token: string,
    pageSize: number = 20,
    pageToken?: string,
    filters?: {
      requestStatus?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponsePayload<IPayoutHistoryResponse>> => {
    const queryParams = [
      `pageSize=${pageSize}`,
      pageToken ? `pageToken=${encodeURIComponent(pageToken)}` : '',
      filters?.requestStatus ? `requestStatus=${filters.requestStatus}` : '',
      filters?.startDate ? `startDate=${filters.startDate}` : '',
      filters?.endDate ? `endDate=${filters.endDate}` : '',
    ]
      .filter(Boolean)
      .join('&');

    const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}/wallet/v1/user-payout/requests?${queryParams}`;

    return endpointService.Get<IPayoutHistoryResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

export default walletService;
