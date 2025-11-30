import { ApiErrorResponsePayload } from '../abstractions/models/ApiResponsePayload';
import IAbstractService from "../abstractions/interfaces/IAbstractService";
import ApiResponsePayload from "../abstractions/models/ApiResponsePayload";
import { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

export class EndpointService implements IAbstractService {
  [x: string]: any;
  _httpClient?: AxiosInstance;

  constructor(httpClient: AxiosInstance) {
    this._httpClient = httpClient;
  }

  Client(httpClient: AxiosInstance): void {
    this._httpClient = httpClient;
  }

  async Get<TResponsePayloadType, D = any>(
    path: string,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
    //  console.log('[EndpointService][GET]', path, { config });
      var result = await this._httpClient?.get<ApiResponsePayload<TResponsePayloadType>>(
        path,
        config
      );
      // console.log('[EndpointService][GET][RESPONSE]', path, result?.data);
    //  console.log('[EndpointService][GET][RESPONSE]', path, result?.data);

      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err:any) {
  
      var errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data


      // console.error('[EndpointService][GET][ERROR]', path,  errorResponse);
      return {
        detail: errorResponse?.detail,
        responseCode: errorResponse?.code||err?.response?.status,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred"
      };
    }
  }

  async GetWithParams<TRequestPayload, TResponsePayloadType, D = any>(
    path: string,
    params: TRequestPayload,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
     // console.log('[EndpointService][GET][WithParams]', path, { params, config });
      var result = await this._httpClient?.get<ApiResponsePayload<TResponsePayloadType>>(
        path,
        { params, ...config }
      );
     // console.log('[EndpointService][GET][WithParams][RESPONSE]', path, result);
      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err) {
      // console.error('[EndpointService][GET][WithParams][ERROR]', path, err);
      var errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data
      return {
        detail: errorResponse?.detail,
        responseCode: errorResponse?.code,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred"
      };
    }
  }

  async GetAll<TRequestPayload, TResponsePayloadType, D = any>(
    path: string,
    params: TRequestPayload,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
    // console.log('[EndpointService][GET][All]', path, { params, config });
      var result = await this._httpClient?.get<ApiResponsePayload<TResponsePayloadType>>(
        path,
        { params, ...config },
      );
// console.log('[EndpointService][GET][All][RESPONSE]', path, result);
      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err) {
    // console.error('[EndpointService][GET][All][ERROR]', path, err);
      var errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data
      return {
        detail: errorResponse?.detail,
        responseCode: errorResponse?.code,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred"
      };
    }
  }

  async Post<TRequestPayload, TResponsePayloadType, D = any>(
    path: string,
    payload: TRequestPayload,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
   // console.log('[EndpointService][POST]', path, { payload, config });
   // console.log('[EndpointService][POST]', path, { payload, config });
      var result = await this._httpClient?.post<ApiResponsePayload<TResponsePayloadType>>(
        path,
        payload,
        config
      );
      // console.log('[EndpointService][POST][RESPONSE]', path, result);
      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err:any) {
    // console.error('[EndpointService][POST][ERROR]==', path, err,JSON.stringify(err, null, 2),payload);
      var errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data


      return {
       ...errorResponse,
        detail: errorResponse?.detail,
        responseCode: errorResponse?.code||err?.response?.status,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred"
      };
    }
  }

  async PostWihtoutRequestBody<TResponsePayloadType, D = any>(
    path: string,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
     // console.log('[EndpointService][POST][NoBody]', path, { config });
      const result = await this._httpClient?.post<ApiResponsePayload<TResponsePayloadType>>(
        path,
        undefined, // Pass undefined as the payload
        config
      );
    // console.log('[EndpointService][POST][NoBody][RESPONSE]', path, result);
      // httpClient already extracts the data, so return result directly
      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err: any) {
     //s console.error('[EndpointService][POST][NoBody][ERROR]', path, err);
      const errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data;
  
      return {
        ...errorResponse,
        detail: errorResponse?.detail,
        responseCode: errorResponse?.code || err?.response?.status,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred"
      };
    }
  }

  async Put<TRequestPayload, TResponsePayloadType, D = any>(
    path: string,
    payload: TRequestPayload,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
    //  console.log('[EndpointService][PUT]', path, { payload, config });
      var result = await this._httpClient?.put<ApiResponsePayload<TResponsePayloadType>>(
        path,
        payload,
        config
      );
      // console.log('[EndpointService][PUT][RESPONSE]', path, result);
      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err:any) {
    // console.error('[EndpointService][PUT][ERROR]', path, err);
      var errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data


      // console.error('[EndpointService][PUT][ERROR] response', path, errorResponse);
      return {
        ...errorResponse,
        detail: errorResponse?.detail,  
        responseCode: errorResponse?.code||err?.response?.status,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred",

      };
    }
  }

  async PutWithoutRequestBody<TResponsePayloadType, D = any>(
    path: string,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
    //  console.log('[EndpointService][PUT][NoBody]', path, { config });
      const result = await this._httpClient?.put<ApiResponsePayload<TResponsePayloadType>>(
        path,
        undefined, // Pass undefined as the payload
        config
      );
    // console.log('[EndpointService][PUT][NoBody][RESPONSE]', path, result);
      // httpClient already extracts the data, so return result directly
      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err: any) {
      // console.error('[EndpointService][PUT][NoBody][ERROR]', path, err);
      const errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data;
  
      return {
        ...errorResponse,
        detail: errorResponse?.detail,
        responseCode: errorResponse?.code || err?.response?.status,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred",
      };
    }
  }

  async Delete<TResponsePayloadType, D = any>(
    path: string,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
      var result = await this._httpClient?.delete<ApiResponsePayload<TResponsePayloadType>>(
        path,
        config
      );
      // httpClient already extracts the data, so return result directly
      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err: any) {
      // console.error('[EndpointService][DELETE][ERROR]', path, err);
      var errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data
      
      const status = err?.response?.status;
      
      return {
        ...errorResponse,
        detail: errorResponse?.detail,
        responseCode: errorResponse?.code || err?.response?.status,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred"
      };
    }
  }

  async DeleteWithRequestBody<TRequestPayload, TResponsePayloadType, D = any>(
    path: string,
    payload: TRequestPayload,
    config?: AxiosRequestConfig<D>
  ): Promise<ApiResponsePayload<TResponsePayloadType>> {
    try {
     // console.log('[EndpointService][DELETE][WithBody]', path, { payload, config });
      const result = await this._httpClient?.delete<ApiResponsePayload<TResponsePayloadType>>(
        path,
        {
          ...config,
          data: payload, // Include payload in the `data` field
        }
      );
     // console.log('[EndpointService][DELETE][WithBody][RESPONSE]', path, result);
      return result as unknown as ApiResponsePayload<TResponsePayloadType>;
    } catch (err: any) {
    //  console.error('[EndpointService][DELETE][WithBody][ERROR]', path, err);
      const errorResponse = (err as AxiosError<ApiErrorResponsePayload, TResponsePayloadType>).response?.data;

      return {
        ...errorResponse,
        detail: errorResponse?.detail,
        responseCode: errorResponse?.code || err?.response?.status,
        message: errorResponse?.detail ?? errorResponse?.title ?? "An error has occurred",
      };
    }
  }
}
