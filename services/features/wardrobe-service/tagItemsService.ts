import ApiResponsePayload from '@services/http-client/abstractions/models/ApiResponsePayload';
import endpointService from '@services/http-client/endpoints/public/endpointClientService';
import { TagItemsParams, TagItemsResponse } from './types';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const tagItemsService = {
  fetchItems: async (
    params: TagItemsParams,
    token: string,
  ): Promise<ApiResponsePayload<TagItemsResponse>> => {
    // Safely encode query parameters
    const encodedQuery = encodeURIComponent(params.query || '');
    const encodedPageToken = params.pageToken 
      ? encodeURIComponent(params.pageToken) 
      : '';

    const queryParams = [
      `Query=${encodedQuery}`,
      `PageSize=${params.pageSize}`,
      encodedPageToken ? `PageToken=${encodedPageToken}` : '',
      'Status=',
    ]
      .filter(Boolean)
      .join('&');

    const url = `${BASE_URL}/wardrobe/v1/items?${queryParams}`;

    const response = await endpointService.Get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }) as ApiResponsePayload<TagItemsResponse>;

    return response;
  },

  fetchOutfits: async (
    params: TagItemsParams,
    token: string,
  ): Promise<ApiResponsePayload<TagItemsResponse>> => {
    // Safely encode query parameters
    const encodedQuery = encodeURIComponent(params.query || '');
    const encodedTrifterId = params.trifterId 
      ? encodeURIComponent(params.trifterId) 
      : '';
    const encodedPageToken = params.pageToken 
      ? encodeURIComponent(params.pageToken) 
      : '';

    const queryParams = [
      `Query=${encodedQuery}`,
      encodedTrifterId ? `TrifterId=${encodedTrifterId}` : '',
      `PageSize=${params.pageSize}`,
      encodedPageToken ? `PageToken=${encodedPageToken}` : '',
    ]
      .filter(Boolean)
      .join('&');

    const url = `${BASE_URL}/wardrobe/v1/outfits?${queryParams}`;

    return endpointService.Get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
