import { AxiosInstance, AxiosRequestConfig } from 'axios';
import ApiResponsePayload from "../models/ApiResponsePayload";

interface IAbstractService {

  _httpClient?: AxiosInstance;

  /*
 * Set axios HTTP client
 */
  Client(httpClient: AxiosInstance): void;

  /*
   * Get all resources
   */
  GetAll<TRequestPayload, TResponsePayloadType, D = any>(
    path: string,
    params: TRequestPayload,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>>;

  /*
   * Get resource by id
   */
  Get<TResponsePayloadType, D = any>(
    path: string,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>>;

  /*
   * Post resource
   */
  Post<TRequestPayload, TResponsePayloadType, D = any>(
    path: string,
    payload: TRequestPayload,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>>;

  /*
   * Update resource
   */
  Put<TRequestPayload, TResponsePayloadType, D = any>(
    path: string,
    payload: TRequestPayload,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>>;

  /*
   * Delete resource by id
   */
  Delete<TResponsePayloadType, D = any>(
    path: string,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>>;
}

export default IAbstractService;
