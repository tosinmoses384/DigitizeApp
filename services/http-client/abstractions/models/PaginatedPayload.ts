interface PaginatedPayload<TPayload> {
  dataset?: TPayload[];
  hasNextPage: boolean;
  pageSize: number;
  pageItemCount?: number;
  pageToken: string;
}

export interface PaginatedRequestPayload {
  pageSize: number;
  pageToken?: string;
}

export default PaginatedPayload;
