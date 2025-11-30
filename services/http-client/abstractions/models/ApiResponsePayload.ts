// import { IPaginationRequest } from './../../../features/pagination-model/model';
interface ApiResponsePayload<TPayload> {
  data?: TPayload;
  responseCode?: number | string;
  message: string;
  status?:number;
  detail?: string;
  errors?: Map<string, string[]>
}

export interface ApiErrorResponsePayload {
  title: string;
  status?: number;
  code?: number;
  detail: string;
  errors?: Map<string, string[]>
}

export default ApiResponsePayload;
